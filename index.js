require("dotenv").config();

const express = require("express");
const { WebClient } = require("@slack/web-api");

const app = express();

// Enabling Slack client
const web = new WebClient(process.env.SLACK_BOT_TOKEN);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

/**
 * @route POST /slack/commands
 * @description This is triggered when a user types the custom slash command (/approval-test).
 * It opens a modal prompting the user to select an approver and enter a message.
 */
app.post("/slack/commands", async (req, res) => {
  const { trigger_id } = req.body;

  res.status(200).send();

  try {
    // Load users from slack
    const usersResponse = await web.users.list();

    // Filter bots i.e. `USLACKBOT`
    const users = usersResponse.members.filter(
      (user) => !user.is_bot && user.id !== "USLACKBOT"
    );

    // Prepare approvers dropdowns
    const approvers = users.map((user) => ({
      text: {
        type: "plain_text",
        text: user.real_name || user.name,
      },
      value: user.id,
    }));

    // Prepare reponse
    const modalView = {
      type: "modal",
      callback_id: "approval_modal",
      title: {
        type: "plain_text",
        text: "Approval Request",
      },
      submit: {
        type: "plain_text",
        text: "Submit",
      },
      close: {
        type: "plain_text",
        text: "Cancel",
      },
      blocks: [
        {
          type: "input",
          block_id: "approver_section",
          label: {
            type: "plain_text",
            text: "Select an approver",
          },
          element: {
            type: "static_select",
            action_id: "approver_select",
            placeholder: {
              type: "plain_text",
              text: "Choose someone",
            },
            options: approvers,
          },
        },
        {
          type: "input",
          block_id: "text_section",
          label: {
            type: "plain_text",
            text: "Approval Message",
          },
          element: {
            type: "plain_text_input",
            action_id: "approval_message",
            multiline: true,
          },
        },
      ],
    };

    // Trigger slack modal
    await web.views.open({
      trigger_id,
      view: modalView,
    });
  } catch (error) {
    console.error("Error opening modal:", error);
  }
});

/**
 * @route POST /slack/actions
 * @description Handles interactions from the modal and any interactive components (like buttons).
 * - When the modal is submitted: Sends the approval request message to the selected approver.
 * - When an approver clicks Approve or Reject: Notifies the requester of the decision.
 */
app.post("/slack/actions", async (req, res) => {
  const payload = JSON.parse(req.body.payload);
  const { user, view, type } = payload;

  // Case: Modal was submitted
  if (type === "view_submission") {
    const approverId =
      view.state.values.approver_section.approver_select.selected_option.value;
    const approvalMessage =
      view.state.values.text_section.approval_message.value;

    try {
      // Send a direct message to the selected approver with approval details and action buttons
      await web.chat.postMessage({
        channel: approverId,
        text: `You have an approval request from <@${user.id}>`,
        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `*Message:*\n${approvalMessage}`,
            },
          },
          {
            type: "actions",
            block_id: "approval_buttons",
            elements: [
              {
                type: "button",
                text: {
                  type: "plain_text",
                  text: "Approve",
                },
                style: "primary",
                action_id: "approve",
                value: user.id,
              },
              {
                type: "button",
                text: {
                  type: "plain_text",
                  text: "Reject",
                },
                style: "danger",
                action_id: "reject",
                value: user.id,
              },
            ],
          },
        ],
      });

      // Trigger modal submission
      res.status(200).send();
    } catch (error) {
      console.error("Error sending approval message:", error);
      res.status(500).send("Failed to send message");
    }
  }

  // Case: Approver clicked a button (either Approve or Reject)
  if (type === "block_actions") {
    const action = payload.actions[0];
    const requesterId = action.value; // The original requester’s user ID
    const approverId = payload.user.id;

    // Prepare response msg
    const responseMessage =
      action.action_id === "approve"
        ? `✅ Your request was approved by <@${approverId}>`
        : `❌ Your request was rejected by <@${approverId}>`;

    try {
      // Send a message back to the original caller
      await web.chat.postMessage({
        channel: requesterId,
        text: responseMessage,
      });

      // Trigger slack response
      res.status(200).send();
    } catch (error) {
      console.error("Error sending response to requester:", error);
      res.status(500).send("Failed to send result");
    }
  }
});

/**
 * Start the server on port 3000.
 * You can test it locally using tools like ngrok to expose it to Slack.
 */
const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`Slack bot running on http://localhost:${PORT}`);
});
