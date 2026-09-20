import { HolidayItem, Tone, Platform, VisualCardConfig } from '../types';

export function generateTemplateSentence(holiday: HolidayItem, brandName: string): string {
  const brandPart = brandName ? ` for ${brandName}` : '';
  return `My app takes and collects data from ${holiday.name} (${holiday.date}) and chunks it into platform social post drafts and creative visual scripts with assets that are processed to help me create engaging holiday content${brandPart} for the upcoming campaign and have a sheet that has the track of holiday posts that have been processed.`;
}

export function generatePlatformPosts(
  holiday: HolidayItem,
  tone: Tone,
  brandName: string,
  customCTA: string,
  userAngle?: string
): { instagram: string; linkedin: string; twitter: string; tiktok: string } {
  const brand = brandName.trim() || 'Our Team';
  const cta = customCTA.trim() || 'Let us know your thoughts in the comments below!';
  const angle = userAngle?.trim() || holiday.recommendedAngle;
  const hashtags = holiday.defaultHashtags.join(' ');

  // 1. Instagram: Visual, emojis, line breaks, community question, hashtags
  let igToneHook = holiday.suggestedHooks[0];
  let igBody = '';

  if (tone === 'celebratory') {
    igToneHook = `✨ Happy ${holiday.name}! ${holiday.emoji}`;
    igBody = `Today, we are taking a moment to celebrate the joy, memories, and spirit of ${holiday.name}.\n\nWhether you are gathering with loved ones, taking some well-deserved downtime, or celebrating in your own special way—${brand} is wishing you warmth and happiness!\n\n${cta}`;
  } else if (tone === 'promotional') {
    igToneHook = `🎉 Celebrate ${holiday.name} with something special! ${holiday.emoji}`;
    igBody = `In honor of ${holiday.name}, we're giving back to our amazing community.\n\nEnjoy an exclusive holiday treat from ${brand}! Swipe through to check out what we've prepared for you.\n\n👉 Tap the link in our bio to claim yours today!\n\n${cta}`;
  } else if (tone === 'humorous') {
    igToneHook = `Reality check for ${holiday.name}: ${holiday.emoji}`;
    igBody = `Expectation: Aesthetic celebrations and endless zen.\nReality: 4 alarms snoozed and still wondering how it's already ${holiday.name}.\n\nDrop an emoji below that describes your mood right now! 👇\n\n${cta}`;
  } else if (tone === 'storytelling') {
    igToneHook = `A small reflection for ${holiday.name}... ${holiday.emoji}`;
    igBody = `Holidays like ${holiday.name} always remind us of why we started ${brand} in the first place.\n\nBehind every project, campaign, and milestone are the real people who make it meaningful. Today, we're pausing to count our blessings and express gratitude to everyone walking this road with us.\n\n${cta}`;
  } else if (tone === 'thoughtful') {
    igToneHook = `Pause and reflect: It’s ${holiday.name}. ${holiday.emoji}`;
    igBody = `In a world that never stops rushing, ${holiday.name} offers a gentle reminder to slow down, appreciate the progress made, and prioritize what truly matters.\n\nSending peace, clarity, and kindness your way from all of us at ${brand}.\n\n${cta}`;
  } else {
    // engaging
    igToneHook = `${holiday.emoji} It’s ${holiday.name}! Let’s settle something:`;
    igBody = `${holiday.suggestedHooks[1] || holiday.suggestedHooks[0]}\n\nWe love hearing how people across our community celebrate. What is your #1 holiday tradition?\n\n${cta}`;
  }

  const instagram = `${igToneHook}\n\n${igBody}\n\n.\n.\n.\n${hashtags}`;

  // 2. LinkedIn: Professional tone, workplace culture, key takeaway, structured formatting
  let liHook = holiday.suggestedHooks[0];
  let liBody = '';

  if (tone === 'promotional') {
    liHook = `How we’re marking ${holiday.name} at ${brand}:`;
    liBody = `Milestones and observances like ${holiday.name} provide a valuable touchpoint to connect authentically with clients and partners.\n\nTo celebrate, we are unlocking a special holiday showcase for our network.\n\nHere’s what we learned when building this for our audience:\n1. Timing and relevance drive resonance\n2. Authentic gratitude outperforms hard-selling\n3. Delivering immediate value builds long-term trust\n\nHow does your organization navigate seasonal campaigns?`;
  } else if (tone === 'thoughtful' || tone === 'storytelling') {
    liHook = `${holiday.name} brings an important reminder for leaders and teams:`;
    liBody = `As we observe ${holiday.name}, it's worth reflecting on how we create space for celebration and renewal in high-growth environments.\n\nAt ${brand}, our biggest takeaway this season is simple:\nGreat work happens when people feel seen, supported, and allowed to celebrate what matters.\n\nTo our clients, teammates, and peers: thank you for your ongoing partnership.\n\nWhat is one lesson this season has taught your team?`;
  } else {
    liHook = `Observing ${holiday.name}: A quick reflection on community and impact.`;
    liBody = `Holidays like ${holiday.name} are more than dates on a marketing calendar—they are opportunities to reflect on our collective culture and shared values.\n\nAt ${brand}, we believe that taking the time to acknowledge meaningful observances strengthens both workplace morale and client relationships.\n\nWishing all our connections, partners, and colleagues a rewarding ${holiday.name}!\n\n${cta}`;
  }

  const linkedin = `${liHook}\n\n${liBody}\n\n${holiday.defaultHashtags.slice(0, 3).join(' ')}`;

  // 3. Twitter/X: Concise, punchy, high-engagement hook under 280 chars
  const shortHook = holiday.suggestedHooks[0].slice(0, 100);
  const twitter = `${holiday.emoji} Happy ${holiday.name} from the ${brand} team!\n\n${shortHook}\n\nHow are you celebrating today? Drop your thoughts 👇\n${holiday.defaultHashtags.slice(0, 2).join(' ')}`;

  // 4. TikTok / Reels: 30-sec script with visual cues, spoken hook, and camera directions!
  const tiktok = `[0:00 - 0:03] HOOK (Fast cut to camera / festive visual):\n"Stop scrolling—if you celebrate ${holiday.name}, you need to hear this."\n\n[0:03 - 0:12] SETUP (B-roll or text overlay on screen):\n"Most people don't realize this about ${holiday.name}, but here is how we're doing things differently at ${brand} this year..."\n\n[0:12 - 0:22] VALUE / STORY (Graphic card / product preview):\n"${holiday.description} Whether you're taking a day off or diving in, remember: ${angle}."\n\n[0:22 - 0:30] CTA / WRAP-UP (Direct to camera):\n"Tell us your #1 tradition in the comments, and follow for more holiday ideas!"`;

  return { instagram, linkedin, twitter, tiktok };
}

export function getDefaultVisualConfig(holiday: HolidayItem, brandName: string): VisualCardConfig {
  return {
    format: 'square_1_1',
    themeIndex: 0,
    headline: `Happy ${holiday.name}!`,
    subheading: holiday.description.length > 70 ? holiday.description.slice(0, 68) + '...' : holiday.description,
    badgeText: holiday.categoryLabel.toUpperCase(),
    brandName: brandName || 'OUR BRAND',
    cta: 'SWIPE & CELEBRATE',
    emoji: holiday.emoji,
    fontStyle: 'display',
    pattern: 'sparkles',
    overlayIntensity: 0.15,
  };
}
