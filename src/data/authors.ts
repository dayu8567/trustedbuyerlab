export const AUTHORS = {
  editorial: {
    id: "editorial",
    name: "Trusted Buyer Lab Editorial",
    role: "Research and buying guidance",
    bio: "The editorial team compares published specifications, manufacturer documentation, and ownership constraints. We distinguish desk research from hands-on testing.",
  },
  newsroom: {
    id: "newsroom",
    name: "Trusted Buyer Lab Newsroom",
    role: "Automated price briefs",
    bio: "Price briefs are assembled from structured affiliate-feed data, then checked for timestamp, price consistency, and source integrity before publication.",
  },
} as const;

export type AuthorId = keyof typeof AUTHORS;
