const messageTemplate = new Map([
  [
    "direct-requests-received",
    {
      add: {
        message: " sent a request to chat with you.",
      },
      remove: {
        message: " has removed their request to chat with you.",
      },
    },
  ],

  [
    "direct-requests-sent",
    {
      accepted: {
        message: " has accepted your request to chat.",
      },
      declined: {
        message: " has declined your request to chat.",
      },
    },
  ],

  [
    "group-invites-received",
    {
      add: {
        message: " sent an invitation for you to join ",
      },

      remove: {
        message: " has removed their invitation for you to join ",
      },
    },
  ],

  [
    "group-invites-sent",
    {
      accepted: {
        message: " has accepted your invitation to join ",
      },
      declined: {
        message: " has declined your invitation to join ",
      },
    },
  ],

  [
    "group-requests-received",
    {
      add: {
        message: " sent you a request to join ",
      },

      remove: {
        message: " has removed their request to join ",
      },
    },
  ],

  [
    "group-requests-sent",
    {
      accepted: {
        message: " has accepted your request to join ",
      },
      declined: {
        message: " has declined your request to join ",
      },
    },
  ],
]);

module.exports = messageTemplate;
