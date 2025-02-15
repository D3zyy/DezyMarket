import { prisma } from "./database/db";

export default async function sitemap() {
  // Získej všechny příspěvky z databáze
  const posts = await prisma.posts.findMany();

  // Vytvoř seznam sitemap z příspěvků
  const sitemapUrls = [
    {
      url: 'https://dezy.cz',
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 1,
    },
    ...posts.map(post => ({
      url: `https://dezy.cz/post/${post.id}`, // dynamická URL pro každý post
      lastModified: new Date(),  // Zde můžeš případně použít `post.updatedAt` pro přesnější data
      changeFrequency: 'daily',
      priority: 0.8,  // Můžeš upravit prioritu podle potřeby
    })),
  ];

  return sitemapUrls;
}