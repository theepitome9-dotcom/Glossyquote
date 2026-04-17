import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, ScrollView, Pressable, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getAnthropicTextResponse } from '../../api/chat-service';
import { AIMessage } from '../../types/ai';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// Knowledge base for common professional questions
const professionalKnowledge: Record<string, string> = {
  // Lead costs
  'lead cost': `Each lead costs **6 credits** (or **4 credits** for Premium members).

Here are our credit packages:
• **Trial**: £15 for 10 credits (~1-2 leads)
• **Starter**: £35 for 28 credits (~4-7 leads) - 17% off
• **Professional**: £50 for 46 credits (~7-11 leads) - 27% off - Most popular!
• **Business**: £99 for 100 credits (~16-25 leads) - 34% off
• **Premium Pack**: £169 for 200 credits (~33-50 leads) - 43% off
• **Premium Pro**: £229 for 290 credits (~48-72 leads) - 47% off - Best value!

The more credits you buy, the lower the cost per lead.

**Ready to get started?** Head to the Credits screen to purchase your first package!`,

  'how much': `Each lead costs **6 credits** to unlock (or **4 credits** for Premium subscribers).

Our packages:
• **Trial**: £15 for 10 credits
• **Starter**: £35 for 28 credits
• **Professional**: £50 for 46 credits - Popular!
• **Business**: £99 for 100 credits
• **Premium Pack**: £169 for 200 credits
• **Premium Pro**: £229 for 290 credits - Best value!

Premium subscribers also get 33% cheaper leads (4 credits vs 6).

**Get started now** - Purchase credits and unlock your first lead today!`,

  'price': `Lead pricing works on a credit system:

**Standard**: 6 credits = 1 lead
**Premium members**: 4 credits = 1 lead (33% cheaper!)

Packages:
• Trial: £15 → 10 credits
• Starter: £35 → 28 credits
• Professional: £50 → 46 credits
• Business: £99 → 100 credits
• Premium Pack: £169 → 200 credits
• Premium Pro: £229 → 290 credits

Buying larger packages reduces your cost per credit significantly.

**Don't miss out** - New leads are posted daily. Get your credits now!`,

  // ROI
  'roi': `Great question! Here's the ROI breakdown:

**Average painting job value**: £800-£2,500
**Lead cost**: ~£5-8 per lead depending on package
**Conversion rate**: Industry average 20-30%

Even at 20% conversion with 10 leads (~£50), you'd win 2 jobs worth £1,600-5,000. That's a **30x+ return** on your investment!

Top professionals on GLOSSY report closing 1 in 3 leads.

**Start earning today** - Get your credits and unlock high-value leads!`,

  'return': `The ROI on GLOSSY leads is exceptional:

• Leads cost £5-8 each depending on package
• Average job: £800-2,500
• Only 4 professionals max per lead

If you close just 1 in 5 leads, a £50 investment could return £800+. Many pros report even better conversion rates!

**Ready to grow your business?** Purchase credits now and start winning jobs!`,

  // Credit packages
  'package': `We offer 6 credit packages:

**Trial Pack** - £15
• 10 credits (~1-2 leads)
• Perfect for trying us out

**Starter Pack** - £35
• 28 credits (~4-7 leads)
• 17% savings

**Professional Pack** - £50 - Popular!
• 46 credits (~7-11 leads)
• 27% savings

**Business Pack** - £99
• 100 credits (~16-25 leads)
• 34% savings

**Premium Pack** - £169
• 200 credits (~33-50 leads)
• 43% savings

**Premium Pro Pack** - £229 - Best Value!
• 290 credits (~48-72 leads)
• 47% savings (Premium members only)

All credits never expire!

**Get started** - Head to the Credits screen to purchase your package!`,

  'which package': `I'd recommend based on your goals:

**Just starting?** → Trial (£15, 10 credits)
Test the platform with minimal investment

**Want to try properly?** → Starter (£35, 28 credits)
Get 4-7 leads to see real results

**Ready for steady work?** → Professional (£50, 46 credits)
Most popular - great balance of value and volume

**Serious about growth?** → Business (£99, 100 credits)
Best for busy professionals

**Maximum value?** → Premium Pack (£169) or Premium Pro (£229)
Lowest cost per credit!

All credits never expire, so no pressure to use them quickly.

**Take the next step** - Purchase your credits and start winning jobs today!`,

  // Lead quality / competition
  'competition': `On GLOSSY, each lead is shared with **maximum 4 professionals**.

This is much better than other platforms (some share with 10+). Fewer competitors = higher chance of winning the job!

**Get ahead of the competition** - Purchase credits now and be one of the first to respond to new leads!`,

  'quality': `GLOSSY leads are high quality because:

• **Verified customers** - real homeowners ready to hire
• **Maximum 4 professionals** per lead
• **Detailed job info** - property type, room sizes, postcode
• **Customer budget indicated** - no time wasters

Customers have already calculated their estimate, so they're serious about getting the work done.

**Access quality leads** - Get your credits and start connecting with ready-to-hire customers!`,

  'how many professionals': `Each lead is shared with a **maximum of 4 professionals**.

This gives you a 25% base chance before you even start! Compare that to platforms that share with 10+ pros.

Quick response and a professional approach can significantly increase your win rate.

**Be first to respond** - Purchase credits now and unlock leads as soon as they're posted!`,

  // Getting more leads
  'more leads': `Tips to get more leads:

1. **Complete your profile** - add photos of your work
2. **Respond quickly** - customers often go with first responder
3. **Keep credits topped up** - don't miss opportunities
4. **Check notifications** - new leads go fast!

The Business pack (£99, 100 credits) or Premium Pack (£169, 200 credits) gives you plenty of leads to build momentum.

**Ready to grow?** Head to the Credits screen and stock up on credits!`,

  // Credits
  'credits': `The credit system is simple:

• **6 credits = 1 lead** (standard)
• **4 credits = 1 lead** (Premium members - 33% cheaper!)
• Credits never expire
• Buy in packages for better value

Current packages:
• Trial: 10 credits - £15
• Starter: 28 credits - £35
• Professional: 46 credits - £50
• Business: 100 credits - £99
• Premium Pack: 200 credits - £169
• Premium Pro: 290 credits - £229

When you see a lead you want, just use credits to unlock the customer's contact details.

**Get started now** - Purchase your first credit package today!`,

  'how does it work': `Here's how GLOSSY works for professionals:

1. **Browse leads** - See job details in your area
2. **Unlock leads** - Use 6 credits (4 for Premium) to get customer contact info
3. **Contact customer** - Call or message directly
4. **Win the job** - Provide your quote and win!

Only 4 professionals max can unlock each lead, giving you great odds. Credits never expire, so buy with confidence!

**Start now** - Purchase credits and unlock your first lead today!`,

  // Premium subscription
  'premium': `**Premium Subscription** gives you major advantages:

**£49/month** (or £490/year - save ~17%)
• **60 credits per month** included
• **33% cheaper leads** - 4 credits vs 6
• Priority customer support
• Advanced analytics & reporting
• Premium Pro badge on profile
• Access to Premium Pro Pack (best value credits)

**7-Day Free Trial** available with 12 credits to try!

Premium members get much better value per lead. If you're serious about growing your business, it pays for itself quickly.

**Go Premium** - Start your free trial today!`,

  'subscription': `Our Premium subscription offers incredible value:

**Monthly**: £49/month with 60 credits
**Annual**: £490/year (save ~17%) with 720 credits

Premium benefits:
• 33% cheaper leads (4 credits instead of 6)
• 60 credits per month included
• Priority placement in searches
• Premium Pro badge
• Access to exclusive Premium Pro Pack
• Advanced analytics

**Try it free** - 7-day trial with 12 credits included!`,

  'trial': `**7-Day Premium Trial**

Try Premium FREE for 7 days:
• 12 credits included (3 leads)
• 33% cheaper leads (4 vs 6 credits)
• Premium Pro badge
• Priority placement

Card required upfront, but no charge for 7 days. Cancel anytime before trial ends = £0. After trial, auto-converts to £49/month.

**Start your free trial** - Register on the Professional Login screen!`,

  // Default/greeting
  'hello': `Hello! I'm your GLOSSY Assistant. I can help you with:

• Understanding lead costs and packages
• ROI calculations
• How the credit system works
• Premium subscription benefits
• Tips for winning more jobs

What would you like to know?

**Ready to get started?** Head to the Credits screen to purchase your first package!`,

  'hi': `Hi there! I'm here to help you understand the GLOSSY platform.

Common questions I can answer:
• How much do leads cost?
• What's the ROI?
• Which package should I buy?
• What are Premium benefits?

What's on your mind?

**Pro tip**: The sooner you get credits, the sooner you can start winning jobs!`,

  // Customer service enquiries for professionals
  'phone': `You can reach our support team by phone!

**Call us:** 07378 825257

**Support Hours:**
• Mon-Fri: 9:00 AM - 6:00 PM
• Saturday: 10:00 AM - 4:00 PM
• Sunday: Closed

You can also:
• **WhatsApp:** 07378 825257
• **Email:** glossyquote@gmail.com

Or tap **Contact Us** in your Profile for all options.`,

  'contact': `**How to reach GLOSSY Support:**

📞 **Call:** 07378 825257
💬 **WhatsApp:** 07378 825257
📧 **Email:** glossyquote@gmail.com

**Support Hours:**
• Mon-Fri: 9:00 AM - 6:00 PM
• Saturday: 10:00 AM - 4:00 PM
• Sunday: Closed

Tap **Contact Us** in your Profile for quick access to all options.

We aim to respond to all enquiries **within 24 hours**.`,

  'call': `You can call our support team directly!

📞 **Call:** 07378 825257

**Support Hours:**
• Mon-Fri: 9:00 AM - 6:00 PM
• Saturday: 10:00 AM - 4:00 PM
• Sunday: Closed

Prefer messaging? Try:
• **WhatsApp:** 07378 825257
• **Email:** glossyquote@gmail.com`,

  'whatsapp': `You can reach us on WhatsApp!

💬 **WhatsApp:** 07378 825257

**Support Hours:**
• Mon-Fri: 9:00 AM - 6:00 PM
• Saturday: 10:00 AM - 4:00 PM
• Sunday: Closed

We aim to respond **within 24 hours**.`,

  'email': `You can email our support team at:

📧 **glossyquote@gmail.com**

Or tap **Contact Us** in your Profile for quick access.

We respond to all enquiries **within 24 hours**. Please include your registered email address and details of your query so we can assist you promptly.

**Other ways to reach us:**
• **Call:** 07378 825257
• **WhatsApp:** 07378 825257`,

  'support': `**GLOSSY Professional Support**

We're here to help! Contact us:
📞 **Call:** 07378 825257
💬 **WhatsApp:** 07378 825257
📧 **Email:** glossyquote@gmail.com

**Support Hours:**
• Mon-Fri: 9:00 AM - 6:00 PM
• Saturday: 10:00 AM - 4:00 PM
• Sunday: Closed

Tap **Contact Us** in your Profile for quick access.

We aim to respond **within 24 hours**.`,

  'hours': `**Support Hours:**

• **Monday - Friday:** 9:00 AM - 6:00 PM
• **Saturday:** 10:00 AM - 4:00 PM
• **Sunday:** Closed

**Contact us:**
📞 Call: 07378 825257
💬 WhatsApp: 07378 825257
📧 Email: glossyquote@gmail.com

Messages received outside hours will be answered on the next working day.`,

  'speak to someone': `I understand you'd like to speak with someone from our team.

**Call us:** 07378 825257

**Support Hours:**
• Mon-Fri: 9:00 AM - 6:00 PM
• Saturday: 10:00 AM - 4:00 PM
• Sunday: Closed

You can also:
• **WhatsApp:** 07378 825257
• **Email:** glossyquote@gmail.com

We'll get back to you **within 24 hours**.`,

  'human': `I'm an AI assistant, but our human support team is always available!

**To speak with a person:**
📞 **Call:** 07378 825257
💬 **WhatsApp:** 07378 825257
📧 **Email:** glossyquote@gmail.com

**Support Hours:**
• Mon-Fri: 9:00 AM - 6:00 PM
• Saturday: 10:00 AM - 4:00 PM
• Sunday: Closed

Is there something specific you need help with? I might be able to assist right away!`,

  'refund': `For refund requests on credits or subscriptions, please contact our support team:

📞 **Call:** 07378 825257
💬 **WhatsApp:** 07378 825257
📧 **Email:** glossyquote@gmail.com

Please include:
• Your registered email address
• Date and amount of purchase
• Reason for refund request

**We'll review your request and respond within 24 hours.**`,

  'cancel': `To cancel your subscription or manage your account, contact us:

📞 **Call:** 07378 825257
💬 **WhatsApp:** 07378 825257
📧 **Email:** glossyquote@gmail.com

Please include your registered email address and let us know what you'd like to cancel.

Note: Unused credits don't expire, so there's no rush!

**We'll process your request within 24 hours.**`,

  'help': `I'm here to help! Here's what I can assist with:

• Lead costs and credit packages
• ROI and value questions
• Premium subscription benefits
• How the platform works
• Tips for winning more jobs

**Need to speak with our team?**
📞 Call: 07378 825257
💬 WhatsApp: 07378 825257
📧 Email: glossyquote@gmail.com

What would you like to know?`,
};

// Knowledge base for customer questions
const customerKnowledge: Record<string, string> = {
  'measure': `To measure your rooms accurately:

1. **Length**: Measure the longest wall in metres
2. **Width**: Measure the wall perpendicular to it
3. **Round up** to the nearest 0.5m if unsure

Example: A room 4.2m x 3.8m would be entered as 4.5m x 4m.

Don't worry about being exact - we use these for estimates, and the professional will confirm on-site.

**Ready to get your estimate?** Tap "Get Estimate" on the home screen to start!`,

  'pricing': `Several factors affect your painting estimate:

• **Property type** - Flat, house, or commercial
• **Location** - Prices vary by postcode
• **Room size** - Larger rooms cost more
• **Number of rooms** - We offer multi-room discounts

The estimate gives you a realistic range. Professionals may adjust based on condition of walls, prep work needed, etc.

**Get your personalised estimate** - It only takes 2 minutes!`,

  'free': `Yes! **Posting your job is completely FREE**.

Here's how it works:
1. Get your instant estimate
2. Post your job (no cost!)
3. Up to 4 verified professionals will contact you
4. Choose the best quote

You only pay the professional you hire - GLOSSY posting is always free.

**Post your job now** - Get quotes from verified professionals today!`,

  'professionals': `When you post your job:

• **Up to 4 qualified professionals** will contact you
• All are **verified painters** in your area
• They'll provide their **individual quotes**
• You choose who to hire

Having multiple quotes helps you find the best price and fit for your project!

**Get started** - Post your job and receive quotes within hours!`,

  'how long': `Typical timeline after posting:

• **Within hours**: Professionals start contacting you
• **24-48 hours**: You'll likely have all quotes
• **You decide**: No rush - take your time choosing

Response times vary by location and demand. Busy areas get faster responses!

**Don't wait** - Post your job now to start receiving quotes!`,

  'what affects': `Your painting estimate is based on:

• **Location** - Labour costs vary by area
• **Property type** - Flats, houses, commercial
• **Room dimensions** - Length x Width
• **Number of rooms** - Multi-room discounts apply

The estimate provides a realistic price range. Final quotes from professionals may vary based on wall condition and prep work.

**See your price** - Get an instant estimate now!`,

  'estimate': `Getting an estimate is quick and easy:

1. **Select your trade** - Painting, plastering, or flooring
2. **Enter room details** - Dimensions and property type
3. **Get instant pricing** - See the estimated cost range
4. **Post your job** - Connect with verified professionals

The whole process takes just 2-3 minutes!

**Start now** - Tap "Get Estimate" to see your price!`,

  'post': `Posting your job on GLOSSY:

• **It's FREE** - No cost to post
• **Quick process** - Takes under 5 minutes
• **Get multiple quotes** - Up to 4 professionals respond
• **You're in control** - Choose who to hire

After getting your estimate, you can post your job with one tap!

**Ready to find a professional?** Get your estimate and post your job today!`,

  'hello': `Hello! I'm your GLOSSY Assistant for customers.

I can help you with:
• How to measure your rooms
• Understanding pricing
• The job posting process
• Connecting with professionals

What would you like to know?

**Quick tip**: Get your free estimate to see exactly what your project will cost!`,

  'hi': `Hi there! Welcome to GLOSSY.

I'm here to help you get the best deal on your painting, plastering, or flooring project.

Common questions:
• How do I get an estimate?
• Is posting a job free?
• How many quotes will I get?

**Get started** - Tap "Get Estimate" for instant pricing on your project!`,

  // Customer service enquiries
  'phone': `You can reach our support team by phone!

**Call us:** 07378 825257

**Support Hours:**
• Mon-Fri: 9:00 AM - 6:00 PM
• Saturday: 10:00 AM - 4:00 PM
• Sunday: Closed

You can also:
• **WhatsApp:** 07378 825257
• **Email:** glossyquote@gmail.com

Or tap **Contact Us** in your Settings for all options.`,

  'contact': `**How to reach GLOSSY Support:**

📞 **Call:** 07378 825257
💬 **WhatsApp:** 07378 825257
📧 **Email:** glossyquote@gmail.com

**Support Hours:**
• Mon-Fri: 9:00 AM - 6:00 PM
• Saturday: 10:00 AM - 4:00 PM
• Sunday: Closed

Tap **Contact Us** in your Settings for quick access to all options.

We aim to respond to all enquiries **within 24 hours**.`,

  'call': `You can call our support team directly!

📞 **Call:** 07378 825257

**Support Hours:**
• Mon-Fri: 9:00 AM - 6:00 PM
• Saturday: 10:00 AM - 4:00 PM
• Sunday: Closed

Prefer messaging? Try:
• **WhatsApp:** 07378 825257
• **Email:** glossyquote@gmail.com`,

  'whatsapp': `You can reach us on WhatsApp!

💬 **WhatsApp:** 07378 825257

**Support Hours:**
• Mon-Fri: 9:00 AM - 6:00 PM
• Saturday: 10:00 AM - 4:00 PM
• Sunday: Closed

We aim to respond **within 24 hours**.`,

  'email': `You can email our support team at:

📧 **glossyquote@gmail.com**

Or tap **Contact Us** in your Settings for quick access.

We respond to all enquiries **within 24 hours**. Please include your registered email address and details of your query so we can assist you promptly.

**Other ways to reach us:**
• **Call:** 07378 825257
• **WhatsApp:** 07378 825257`,

  'support': `**GLOSSY Customer Support**

We're here to help! Contact us:
📞 **Call:** 07378 825257
💬 **WhatsApp:** 07378 825257
📧 **Email:** glossyquote@gmail.com

**Support Hours:**
• Mon-Fri: 9:00 AM - 6:00 PM
• Saturday: 10:00 AM - 4:00 PM
• Sunday: Closed

Tap **Contact Us** in your Settings for quick access.

We aim to respond **within 24 hours**.`,

  'hours': `**Support Hours:**

• **Monday - Friday:** 9:00 AM - 6:00 PM
• **Saturday:** 10:00 AM - 4:00 PM
• **Sunday:** Closed

**Contact us:**
📞 Call: 07378 825257
💬 WhatsApp: 07378 825257
📧 Email: glossyquote@gmail.com

Messages received outside hours will be answered on the next working day.`,

  'speak to someone': `I understand you'd like to speak with someone from our team.

**Call us:** 07378 825257

**Support Hours:**
• Mon-Fri: 9:00 AM - 6:00 PM
• Saturday: 10:00 AM - 4:00 PM
• Sunday: Closed

You can also:
• **WhatsApp:** 07378 825257
• **Email:** glossyquote@gmail.com

We'll get back to you **within 24 hours**.`,

  'human': `I'm an AI assistant, but our human support team is always available!

**To speak with a person:**
📞 **Call:** 07378 825257
💬 **WhatsApp:** 07378 825257
📧 **Email:** glossyquote@gmail.com

**Support Hours:**
• Mon-Fri: 9:00 AM - 6:00 PM
• Saturday: 10:00 AM - 4:00 PM
• Sunday: Closed

Is there something specific you need help with? I might be able to assist right away!`,

  'complaint': `I'm sorry to hear you're not happy. We take all feedback seriously.

**To submit a complaint:**
📞 **Call:** 07378 825257
💬 **WhatsApp:** 07378 825257
📧 **Email:** glossyquote@gmail.com

Please include:
• Your registered email
• Details of your concern
• Any relevant dates or reference numbers

**We will respond within 24 hours** and work to resolve your issue as quickly as possible.`,

  'refund': `For refund requests, please contact our support team:

📞 **Call:** 07378 825257
💬 **WhatsApp:** 07378 825257
📧 **Email:** glossyquote@gmail.com

Please include:
• Your registered email address
• Date and amount of purchase
• Reason for refund request

**We'll review your request and respond within 24 hours.**`,

  'cancel': `To cancel or manage your account, contact us:

📞 **Call:** 07378 825257
💬 **WhatsApp:** 07378 825257
📧 **Email:** glossyquote@gmail.com

Please include your registered email address and let us know what you'd like to cancel (subscription, account, job posting, etc.).

**We'll process your request within 24 hours.**`,

  'help': `I'm here to help! Here's what I can assist with:

• Getting painting estimates
• Understanding pricing
• How to post a job
• Connecting with professionals
• General questions about GLOSSY

**Need to speak with our team?**
📞 Call: 07378 825257
💬 WhatsApp: 07378 825257
📧 Email: glossyquote@gmail.com

What would you like to know?`,
};

// Problem/complaint detection patterns
const problemPatterns = [
  /didn'?t\s*(receive|get|see)/i,
  /never\s*(receive|received|got|get|came|arrived|showed|seen)/i,
  /not\s*(receive|received|working|showing|getting)/i,
  /haven'?t\s*(receive|received|got|gotten|seen)/i,
  /problem/i,
  /issue/i,
  /error/i,
  /bug/i,
  /broken/i,
  /wrong/i,
  /mistake/i,
  /failed/i,
  /can'?t\s*(see|find|get|access)/i,
  /doesn'?t\s*(work|show|appear)/i,
  /missing/i,
  /lost/i,
  /charged.*but/i,
  /paid.*but/i,
  /paid.*never/i,
  /paid.*didn/i,
  /paid.*not/i,
  /after.*paid.*no/i,
  /payment.*issue/i,
  /refund/i,
  /complaint/i,
  /frustrated/i,
  /annoyed/i,
  /angry/i,
  /disappointed/i,
  /unhappy/i,
  /terrible/i,
  /awful/i,
  /worst/i,
  /scam/i,
  /rip\s*off/i,
  /help.*urgent/i,
  /still\s*waiting/i,
  /no\s*response/i,
  /where.*(is|are)\s*(my|the)/i,
  /what\s*happened/i,
  /not\s*showing/i,
  /nothing\s*(happened|showed|appeared)/i,
];

// Check if message indicates a problem or complaint
const isProblemMessage = (message: string): boolean => {
  return problemPatterns.some(pattern => pattern.test(message));
};

// Get appropriate response for problems/complaints
const getProblemResponse = (message: string, userType: 'customer' | 'professional'): string => {
  const lowerMessage = message.toLowerCase();

  // Payment/estimate related issues
  if (lowerMessage.includes('paid') || lowerMessage.includes('payment') || lowerMessage.includes('charged') || lowerMessage.includes('estimate')) {
    return `I'm really sorry to hear you're experiencing this issue. **Payment and estimate problems are our top priority.**

Thank you for letting us know - we take this very seriously and want to resolve it for you as quickly as possible.

**Please contact our support team directly:**
📞 **Call:** 07378 825257
💬 **WhatsApp:** 07378 825257
📧 **Email:** glossyquote@gmail.com

Please include:
• Your email address used on the app
• Date and time of the payment
• Brief description of what happened

**We will respond within 24 hours** and make sure this is resolved for you. We apologise for any inconvenience caused.`;
  }

  // Lead/credit related issues (for professionals)
  if (userType === 'professional' && (lowerMessage.includes('lead') || lowerMessage.includes('credit'))) {
    return `I'm sorry you're having trouble with your leads or credits. **We want to make this right.**

Thank you for bringing this to our attention - we'll get this sorted for you.

**Please contact our support team:**
📞 **Call:** 07378 825257
💬 **WhatsApp:** 07378 825257
📧 **Email:** glossyquote@gmail.com

Include your registered email and details about the issue. **We typically respond within 24 hours** and will ensure you're not out of pocket.

We appreciate your patience and apologise for the inconvenience.`;
  }

  // General problem response
  return `I'm sorry to hear you're experiencing difficulties. **Your feedback is important to us** and we want to help resolve this.

Thank you for letting us know about this issue - we take all concerns seriously.

**To get this resolved quickly, contact us:**
📞 **Call:** 07378 825257
💬 **WhatsApp:** 07378 825257
📧 **Email:** glossyquote@gmail.com

Or tap **Contact Us** in your ${userType === 'customer' ? 'Settings' : 'Profile'}.

Please describe what happened and include any relevant details (dates, what you were trying to do, etc.).

**Our support team will respond within 24 hours** to help resolve this for you. We apologise for any frustration this has caused.`;
};

// Function to find best matching answer from knowledge base
const findLocalAnswer = (question: string, userType: 'customer' | 'professional'): string | null => {
  // First, check if this is a problem/complaint message
  if (isProblemMessage(question)) {
    return getProblemResponse(question, userType);
  }

  const normalizedQuestion = question.toLowerCase();
  const knowledge = userType === 'professional' ? professionalKnowledge : customerKnowledge;

  // Check for customer service enquiries FIRST (higher priority)
  if (normalizedQuestion.match(/phone\s*(number)?|telephone|call\s*(you|us|someone)|ring/)) {
    return knowledge['phone'];
  }
  if (normalizedQuestion.match(/speak.*someone|talk.*someone|speak.*human|talk.*human|real\s*person|actual\s*person/)) {
    return knowledge['speak to someone'];
  }
  if (normalizedQuestion.match(/customer\s*service|customer\s*support|support\s*team|get\s*in\s*touch|reach\s*(you|someone)/)) {
    return knowledge['support'];
  }
  if (normalizedQuestion.match(/email\s*address|your\s*email|contact\s*email/)) {
    return knowledge['email'];
  }

  // Check for keyword matches
  for (const [keyword, answer] of Object.entries(knowledge)) {
    if (normalizedQuestion.includes(keyword)) {
      return answer;
    }
  }

  // Professional-specific pattern matching
  if (userType === 'professional') {
    if (normalizedQuestion.match(/cost|price|much|£|pound/)) {
      return professionalKnowledge['lead cost'];
    }
    if (normalizedQuestion.match(/roi|return|worth|value/)) {
      return professionalKnowledge['roi'];
    }
    if (normalizedQuestion.match(/package|buy|purchase/)) {
      return professionalKnowledge['package'];
    }
    if (normalizedQuestion.match(/credit/)) {
      return professionalKnowledge['credits'];
    }
    if (normalizedQuestion.match(/how.*work|getting started|start/)) {
      return professionalKnowledge['how does it work'];
    }
    if (normalizedQuestion.match(/competition|other|professionals|how many/)) {
      return professionalKnowledge['competition'];
    }
  } else {
    // Customer-specific pattern matching
    if (normalizedQuestion.match(/measure|dimension|size|room/)) {
      return customerKnowledge['measure'];
    }
    if (normalizedQuestion.match(/price|cost|affect|factor/)) {
      return customerKnowledge['pricing'];
    }
    if (normalizedQuestion.match(/free|pay|charge/)) {
      return customerKnowledge['free'];
    }
    if (normalizedQuestion.match(/professional|painter|who/)) {
      return customerKnowledge['professionals'];
    }
    if (normalizedQuestion.match(/estimate|quote/)) {
      return customerKnowledge['estimate'];
    }
    if (normalizedQuestion.match(/post|job|listing/)) {
      return customerKnowledge['post'];
    }
    if (normalizedQuestion.match(/how.*work|getting started|start/)) {
      return customerKnowledge['estimate'];
    }
  }

  return null;
};

interface ChatBotProps {
  userType: 'customer' | 'professional';
  onClose: () => void;
  onContactSupport?: () => void;
}

export const ChatBot: React.FC<ChatBotProps> = ({ userType, onClose, onContactSupport }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showContactButton, setShowContactButton] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  // System prompt based on user type
  const getSystemPrompt = () => {
    if (userType === 'customer') {
      return `You are GLOSSY Assistant, a helpful AI guide for customers looking to get painting estimates. You help users:
- Understand how to get accurate room measurements
- Choose the right property type
- Explain pricing factors (property type, postcode, room size)
- Guide them through the estimate process
- Answer questions about job posting and connecting with professionals
- Explain the FREE posting option

IMPORTANT: Always encourage users to take action! End your responses by encouraging them to:
- Get an estimate ("Tap 'Get Estimate' to see your price!")
- Post their job ("Post your job to connect with verified professionals!")
- Use the app ("Get started now - it only takes 2 minutes!")

Keep responses concise, friendly, and actionable. Use British English. When discussing measurements, mention that they need length and width in meters.`;
    } else {
      return `You are GLOSSY Assistant, a helpful AI guide for painting professionals. You help tradespeople:
- Understand how the credit system works (6 credits per lead standard, 4 credits for Premium members)
- Explain credit packages:
  • Trial: £15 for 10 credits
  • Starter: £35 for 28 credits
  • Professional: £50 for 46 credits (most popular)
  • Business: £99 for 100 credits
  • Premium Pack: £169 for 200 credits
  • Premium Pro: £229 for 290 credits (Premium members only)
- Explain Premium subscription: £49/month or £490/year with 60 credits per month, 33% cheaper leads (4 vs 6 credits)
- 7-Day Free Trial available with 12 credits
- Guide them through purchasing leads
- Answer questions about ROI and lead quality
- Explain the 4-professional limit per job
- Help with profile optimization

IMPORTANT: Always encourage professionals to take action! End your responses by encouraging them to:
- Purchase credits ("Head to the Credits screen to get started!")
- Start winning jobs ("Purchase credits today and unlock your first lead!")
- Consider Premium ("Go Premium for 33% cheaper leads!")
- Act fast ("New leads are posted daily - don't miss out!")

Keep responses concise, professional, and business-focused. Use British English. Emphasize the value proposition and ROI.`;
    }
  };

  // Initial greeting
  useEffect(() => {
    const greeting: ChatMessage = {
      id: Date.now().toString(),
      role: 'assistant',
      content: userType === 'customer'
        ? "Hi! I'm your GLOSSY Assistant. I'm here to help you get an accurate painting estimate and connect with verified professionals.\n\nWhat questions do you have?\n\n**Ready to start?** Tap 'Get Estimate' to see instant pricing for your project!"
        : "Hi! I'm your GLOSSY Assistant for professionals. I can help you understand our lead system, pricing, and how to maximize your ROI.\n\nWhat would you like to know?\n\n**Ready to grow your business?** Head to the Credits screen to get started!",
      timestamp: new Date(),
    };
    setMessages([greeting]);
  }, [userType]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userInput = input.trim();
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: userInput,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Check if this is a problem message - show contact button
    if (isProblemMessage(userInput)) {
      setShowContactButton(true);
    }

    // First, try to find a local answer
    const localAnswer = findLocalAnswer(userInput, userType);

    if (localAnswer) {
      // Use local knowledge base - instant response
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: localAnswer,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMessage]);
      setIsLoading(false);
      return;
    }

    // If no local answer, try AI
    try {
      // Prepare messages for AI
      const aiMessages: AIMessage[] = [
        {
          role: 'user',
          content: getSystemPrompt(),
        },
        ...messages.map(msg => ({
          role: msg.role,
          content: msg.content,
        })),
        {
          role: 'user',
          content: userInput,
        },
      ];

      // Get AI response
      const response = await getAnthropicTextResponse(aiMessages, {
        model: 'claude-sonnet-4-20250514',
        maxTokens: 500,
        temperature: 0.7,
      });

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.content,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      if (__DEV__) {
        console.error('Chat error:', error);
      }
      // Provide a helpful fallback response instead of generic error
      const fallbackResponse = getFallbackResponse(userInput, userType);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: fallbackResponse,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Fallback response when AI is unavailable
  const getFallbackResponse = (question: string, type: 'customer' | 'professional'): string => {
    if (type === 'professional') {
      return `I'd be happy to help! Here's a quick overview:

**Lead Costs**: 6 credits per lead (4 for Premium members)
**Packages**:
• Trial: £15 (10 credits)
• Starter: £35 (28 credits)
• Professional: £50 (46 credits) - Popular!
• Business: £99 (100 credits)
• Premium Pack: £169 (200 credits)
• Premium Pro: £229 (290 credits)

**Premium Subscription**: £49/month with 60 credits included + 33% cheaper leads

For more specific questions, try asking about:
• Lead costs or pricing
• ROI and value
• Credit packages
• Premium subscription benefits

**Ready to start winning jobs?** Head to the Credits screen to purchase your first package!`;
    } else {
      return `I'd be happy to help! Here's what you need to know:

**Posting is FREE** - You never pay to post a job
**Get Multiple Quotes** - Up to 4 professionals will contact you
**Easy Process** - Just enter your room measurements

For more specific questions, try asking about:
• How to measure your rooms
• What affects pricing
• How the posting process works

**Get your free estimate now** - Tap 'Get Estimate' to see your price!`;
    }
  };

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const quickQuestions = userType === 'customer'
    ? [
        "How do I measure my rooms?",
        "What affects pricing?",
        "Can I post for free?",
        "How do I get an estimate?",
      ]
    : [
        "How much does a lead cost?",
        "What's the ROI?",
        "Which package should I buy?",
        "How do I get more leads?",
      ];

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-white"
    >
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 bg-blue-600 border-b border-blue-700">
        <Pressable onPress={onClose} className="flex-row items-center p-1">
          <Ionicons name="chevron-back" size={24} color="white" />
          <Text className="text-white font-medium ml-1">Back</Text>
        </Pressable>
        <View className="flex-row items-center">
          <View className="bg-white rounded-full p-2 mr-2">
            <Ionicons name="chatbubbles" size={16} color="#2563eb" />
          </View>
          <Text className="text-white font-bold text-base">GLOSSY Assistant</Text>
        </View>
        <Pressable onPress={onClose} className="p-2">
          <Ionicons name="close" size={24} color="white" />
        </Pressable>
      </View>

      {/* Messages */}
      <ScrollView
        ref={scrollViewRef}
        className="flex-1 px-4 py-4"
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}

        {isLoading && (
          <View className="flex-row items-center mb-4">
            <View className="bg-gray-100 rounded-2xl px-4 py-3">
              <ActivityIndicator size="small" color="#2563eb" />
            </View>
          </View>
        )}

        {/* Quick Questions */}
        {messages.length === 1 && !isLoading && (
          <View className="mt-4">
            <Text className="text-gray-500 text-sm mb-2">Quick questions:</Text>
            {quickQuestions.map((question, index) => (
              <Pressable
                key={index}
                onPress={() => setInput(question)}
                className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 mb-2"
              >
                <Text className="text-blue-600 text-sm">{question}</Text>
              </Pressable>
            ))}
          </View>
        )}

        {/* Contact Support Button - shown when problem detected */}
        {showContactButton && onContactSupport && (
          <View className="mt-4 mb-2">
            <Pressable
              onPress={onContactSupport}
              className="bg-red-500 rounded-xl px-4 py-4 flex-row items-center justify-center active:opacity-80"
            >
              <Ionicons name="mail" size={20} color="white" />
              <Text className="text-white font-bold ml-2">Contact Support Now</Text>
            </Pressable>
            <Text className="text-gray-500 text-xs text-center mt-2">
              Tap to speak with our support team directly
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Input */}
      <View className="px-4 py-3 border-t border-gray-200 bg-white">
        <View className="flex-row items-center bg-gray-100 rounded-2xl px-4">
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Ask me anything..."
            placeholderTextColor="#9ca3af"
            className="flex-1 py-3 text-base text-gray-900"
            multiline
            maxLength={500}
            onSubmitEditing={sendMessage}
            editable={!isLoading}
          />
          <Pressable
            onPress={sendMessage}
            disabled={!input.trim() || isLoading}
            className={`ml-2 p-2 rounded-full ${
              input.trim() && !isLoading ? 'bg-blue-600' : 'bg-gray-300'
            }`}
          >
            <Ionicons
              name="send"
              size={20}
              color="white"
            />
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const MessageBubble: React.FC<{ message: ChatMessage }> = ({ message }) => {
  const isUser = message.role === 'user';

  // Simple markdown parser for bold text
  const renderFormattedText = (text: string, isUserMessage: boolean) => {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <Text key={index} className={`font-bold ${isUserMessage ? 'text-white' : 'text-gray-900'}`}>
            {part.slice(2, -2)}
          </Text>
        );
      }
      return <Text key={index}>{part}</Text>;
    });
  };

  return (
    <View className={`flex-row mb-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <View className="bg-blue-600 rounded-full p-2 mr-2 h-8 w-8 items-center justify-center">
          <Ionicons name="sparkles" size={16} color="white" />
        </View>
      )}
      <View
        className={`max-w-[75%] rounded-2xl px-4 py-3 ${
          isUser
            ? 'bg-blue-600'
            : 'bg-gray-100'
        }`}
      >
        <Text
          className={`text-base leading-5 ${
            isUser ? 'text-white' : 'text-gray-900'
          }`}
        >
          {renderFormattedText(message.content, isUser)}
        </Text>
        <Text
          className={`text-xs mt-1 ${
            isUser ? 'text-blue-100' : 'text-gray-500'
          }`}
        >
          {message.timestamp.toLocaleTimeString('en-GB', {
            hour: '2-digit',
            minute: '2-digit'
          })}
        </Text>
      </View>
      {isUser && (
        <View className="bg-gray-300 rounded-full p-2 ml-2 h-8 w-8 items-center justify-center">
          <Ionicons name="person" size={16} color="#374151" />
        </View>
      )}
    </View>
  );
};
