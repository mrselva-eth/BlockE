export interface BlockEUser {
  // Primary identifier
  address: string;

  // BlockE UIDs
  beuids: {
    uid: string;
    formattedUid: string;
    mintedAt: Date;
    digits: number;
  }[];
  beuidCount: number;

  // Contacts
  contacts: {
    contactName: string;
    contactAddress: string;
    createdAt: Date;
  }[];

  // Groups
  groups: {
    groupName: string;
    members: string[];
    createdAt: Date;
    groupLogo?: string;
    isCreator: boolean;
  }[];

  // Messages
  messages: {
    messageId: string;
    content: string;
    senderAddress: string;
    receiverAddress: string;
    isGroupMessage: boolean;
    groupId?: string;
    createdAt: Date;
    encryptedContent: string;
  }[];

  // Newsletter Subscriptions
  newsletterSubscriptions: {
    email: string;
    subscribedAt: Date;
  }[];

  // Notifications
  notifications: {
    type: string;
    content: string;
    read: boolean;
    createdAt: Date;
  }[];

  // Profile
  profile: {
    name?: string;
    bio?: string;
    profileImage?: string;
    email?: string; // Added email
    socialLinks: {
      instagram?: string;
      youtube?: string;
      linkedin?: string;
      github?: string; // Added github
      twitter?: string; // Added twitter
    };
    discordUsername?: string; // Added discordUsername
    updatedAt: Date;
  };

  // Search History
  searches: {
    searchedAddress: string;
    resolvedAddress?: string;
    totalHoldingsETH?: number;
    totalHoldingsUSD?: number;
    gasSpentETH?: string;
    isEns: boolean;
    searchCount: number;
    lastSearched: Date;
  }[];

  // Transactions
  transactions: {
    txHash: string;
    type: 'deposit' | 'withdraw' | 'mint' | 'stake' | 'unstake' | 'claim';
    amount: number;
    timestamp: Date;
  }[];

  // User Preferences
  preferences: {
    theme: 'light' | 'dark';
    autoDisconnect: boolean;
    lastUpdated: Date;
  };

  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

