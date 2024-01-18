type Source = {
  id: string;
  type: string;
  name: string;
  trashed_at?: string;
  purged_at?: string;
};
type WebhookBody = {
  type: string;
  trigger: string;
  source: Source;
};

export { WebhookBody };
