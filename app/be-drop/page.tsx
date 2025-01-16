'use client'

import { useState, useEffect, useCallback } from 'react';
import { useWallet } from '@/contexts/WalletContext';
import { useBlockEUID } from '@/hooks/useBlockEUID';
import { BE_TOKEN_ABI, BE_TOKEN_ADDRESS } from '@/utils/beTokenABI';
import { ethers } from 'ethers';
import Image from 'next/image';
import { withWalletProtection } from '@/components/withWalletProtection';
import { CheckCircle2, LogOutIcon as Logout, RefreshCw, AlertTriangle } from 'lucide-react';
import { Gift } from 'lucide-react'
import { useProfile } from '@/hooks/useProfile';
import { useStakingData } from '@/hooks/useStakingData';
import Sidebar from '@/components/Sidebar';
import SocialMediaLinks from '@/components/SocialMediaLinks';
import TransactionStatus from '@/components/TransactionStatus';
import Loader from '@/components/Loader'; // Import the Loader component

interface BEDropProps {
 hasUID: boolean;
}

interface Task {
  title: string;
  description: string;
  reward: number;
  completed: boolean;
  checkCompletion: () => Promise<boolean>;
  icon?: any;
  countThresholds?: number[];
}

const BEDrop: React.FC<BEDropProps> = ({ hasUID }) => {
  const { address, isConnected, isAutoDisconnectEnabled, theme } = useWallet();
  const { ownedUIDs, refetchUIDs } = useBlockEUID();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [airdropBalance, setAirdropBalance] = useState(0);
  const [hasClaimedFreeBE, setHasClaimedFreeBE] = useState(false);
  const { profileData } = useProfile(address);
  const { stakingData } = useStakingData(address);
  const [showClaimButton, setShowClaimButton] = useState(false); // State for claim button visibility
  const [isClaiming, setIsClaiming] = useState(false); // State for claim button loading
  const [claimTransaction, setClaimTransaction] = useState<{ hash: string; status: 'pending' | 'success' | 'error' } | null>(null);
  const [showTransactionStatus, setShowTransactionStatus] = useState(false);


  const checkFreeBEMinted = useCallback(async () => {
    if (!address || !ethers.isAddress(address)) return false; // Check if address is valid

    try {
      const provider = new ethers.JsonRpcProvider('https://polygon-rpc.com');
      const contract = new ethers.Contract(BE_TOKEN_ADDRESS, BE_TOKEN_ABI, provider);
      const balance = await contract.balanceOf(address);
      return Number(ethers.formatUnits(balance, 18)) >= 1000;
    } catch (error) {
      console.error('Error checking free BE mint status:', error);
      return false;
    }
  }, [address]);

  const checkAutoDisconnectUsage = useCallback(async () => {
    if (!address) return false;
    try {
      const response = await fetch(`/api/check-preference?address=${address}&preference=autoDisconnect`);
      if (!response.ok) {
        throw new Error('Failed to fetch preference status');
      }
      const data = await response.json();
      return data.exists;
    } catch (error) {
      console.error('Error checking auto-disconnect usage:', error);
      return false;
    }
  }, [address]);

  const checkThemeUsage = useCallback(async () => {
    if (!address) return false;
    try {
      const response = await fetch(`/api/check-preference?address=${address}&preference=theme`);
      if (!response.ok) {
        throw new Error('Failed to fetch preference status');
      }
      const data = await response.json();
      return data.exists;
    } catch (error) {
      console.error('Error checking theme usage:', error);
      return false;
    }
  }, [address]);

  const checkProfileCompletion = useCallback(async () => {
    if (!profileData || !profileData.socialLinks) return false
    const { name, bio, email } = profileData
    const { instagram, youtube, linkedin, github, twitter } = profileData.socialLinks
    return name && bio && email && instagram && youtube && linkedin && github && twitter
  }, [profileData]);

  const checkDashboardSearches = useCallback(async () => {
    if (!address) return false;
    try {
      const response = await fetch(`/api/check-dashboard-searches?address=${address}`);
      if (!response.ok) {
        throw new Error('Failed to fetch search count');
      }
      const data = await response.json();
      return data.count >= 10;
    } catch (error) {
      console.error('Error checking dashboard searches:', error);
      return false;
    }
  }, [address]);

  const checkConnectedAddressSearch = useCallback(async () => {
    if (!address) return false;
    try {
      const response = await fetch(`/api/check-preference?address=${address}&preference=connectedAddressSearched`);
      if (!response.ok) {
        throw new Error('Failed to fetch preference status');
      }
      const data = await response.json();
      return data.exists;
    } catch (error) {
      console.error('Error checking connected address search:', error);
      return false;
    }
  }, [address]);

  const checkCW2Transactions = useCallback(async (type: 'deposit' | 'withdraw', count: number) => {
    if (!address) return false;
    try {
      const response = await fetch(`/api/cw2?address=${address}`);
      if (!response.ok) {
        throw new Error('Failed to fetch CW2 data');
      }
      const data = await response.json();
      return data[`${type}Count`] >= count;
    } catch (error) {
      console.error(`Error checking CW2 ${type} count:`, error);
      return false;
    }
  }, [address]);

  const checkContactsCount = useCallback(async (count: number) => {
    if (!address) return false;
    try {
      const response = await fetch(`/api/contacts?userAddress=${address}`);
      if (!response.ok) {
        throw new Error('Failed to fetch contacts');
      }
      const data = await response.json();
      return data.length >= count;
    } catch (error) {
      console.error('Error checking contacts count:', error);
      return false;
    }
  }, [address]);

  const checkGroupsCount = useCallback(async (count: number) => {
    if (!address) return false;
    try {
      const response = await fetch(`/api/groups?userAddress=${address}`);
      if (!response.ok) {
        throw new Error('Failed to fetch groups');
      }
      const data = await response.json();
      return data.length >= count;
    } catch (error) {
      console.error('Error checking groups count:', error);
      return false;
    }
  }, [address]);

  // New function to check BEAIT transactions
  const checkBEAITTransactions = useCallback(async (type: 'deposit' | 'withdraw', count: number) => {
    if (!address) return false;
    try {
      const response = await fetch(`/api/beait?address=${address}`);
      if (!response.ok) {
        throw new Error('Failed to fetch BEAIT data');
      }
      const data = await response.json();
      return data[`${type}Count`] >= count;
    } catch (error) {
      console.error(`Error checking BEAIT ${type} count:`, error);
      return false;
    }
  }, [address]);

  // New function to check BEAI message counts
  const checkBEAICompletion = useCallback(async (count: number) => {
    if (!address) return false;
    try {
      // Assuming you have an API route to fetch BEAI data
      const response = await fetch(`/api/beai-data?address=${address}`); // Replace with your actual API route
      if (!response.ok) {
        throw new Error('Failed to fetch BEAI data');
      }
      const data = await response.json();
      // Assuming your API returns totalInputMessageCount
      return data.totalInputMessageCount >= count;
    } catch (error) {
      console.error('Error checking BEAI message count:', error);
      return false;
    }
  }, [address]);

  // Added checkNewsletterSignup function
  const checkNewsletterSignup = useCallback(async () => {
    if (!address) return false;
    try {
      const response = await fetch(`/api/newsletter?address=${address}`);
      if (!response.ok) {
        throw new Error('Failed to fetch newsletter data');
      }
      const data = await response.json();
      return data.mailCount > 0; // Check if any emails are registered
    } catch (error) {
      console.error('Error checking newsletter signup:', error);
      return false;
    }
  }, [address]);


  useEffect(() => {
    const initializeTasks = async () => {
      const freeBEMinted = await checkFreeBEMinted();
      const autoDisconnectUsed = await checkAutoDisconnectUsage();
      const themeUsed = await checkThemeUsage();
      const profileCompleted = await checkProfileCompletion();
      const dashboardSearchesCompleted = await checkDashboardSearches();
      const connectedAddressSearchCompleted = await checkConnectedAddressSearch();

      const othersResponse = await fetch(`/api/others-data?address=${address}`);
      if (!othersResponse.ok) {
        throw new Error('Failed to fetch others data');
      }
      const othersData = await othersResponse.json();
      const hasLoggedOut = othersData.loggedOut;
      const visitedPages = othersData.visitedPages;

      const depositCount1 = await checkCW2Transactions('deposit', 1);
      const depositCount3 = await checkCW2Transactions('deposit', 3);
      const depositCount5 = await checkCW2Transactions('deposit', 5);
      const withdrawCount1 = await checkCW2Transactions('withdraw', 1);
      const withdrawCount3 = await checkCW2Transactions('withdraw', 3);
      const withdrawCount5 = await checkCW2Transactions('withdraw', 5);

      const has1Contact = await checkContactsCount(1);
      const has3Contacts = await checkContactsCount(3);
      const has5Contacts = await checkContactsCount(5);
      const has1Group = await checkGroupsCount(1);
      const has2Groups = await checkGroupsCount(2);
      const has3Groups = await checkGroupsCount(3);


      const depositCount1BEAIT = await checkBEAITTransactions('deposit', 1);
      const depositCount5BEAIT = await checkBEAITTransactions('deposit', 5);
      const withdrawCount1BEAIT = await checkBEAITTransactions('withdraw', 1);
      const withdrawCount5BEAIT = await checkBEAITTransactions('withdraw', 5);

      const beaiCount1 = await checkBEAICompletion(1);
      const beaiCount10 = await checkBEAICompletion(10);
      const beaiCount50 = await checkBEAICompletion(50);

      const newsletterSignupCompleted = await checkNewsletterSignup();

      setTasks([
        {
          title: 'Claim Your First 1000 BE Tokens',
          description: 'Mint your free BE tokens to get started.',
          reward: 1000,
          completed: freeBEMinted,
          checkCompletion: checkFreeBEMinted,
        },
        {
          title: 'Mint One BlockE UID',
          description: 'Secure your unique Web3 identity.',
          reward: 400,
          completed: ownedUIDs.length >= 1,
          checkCompletion: async () => ownedUIDs.length >= 1,
        },
        {
          title: 'Mint Three BlockE UIDs',
          description: 'Expand your BlockE presence.',
          reward: 1000,
          completed: ownedUIDs.length >= 3,
          checkCompletion: async () => ownedUIDs.length >= 3,
        },
        {
          title: 'Use Auto-Disconnect',
          description: 'Enable and disable the auto-disconnect feature.',
          reward: 10,
          // Check if preference exists in 'others' collection, regardless of the value
          completed: autoDisconnectUsed,
          checkCompletion: checkAutoDisconnectUsage,
        },
        {
          title: 'Use Theme Toggle',
          description: 'Switch between light and dark mode.',
          reward: 10,
          completed: themeUsed,
          checkCompletion: checkThemeUsage,
        },
        {
          title: 'Complete Your Profile',
          description: 'Fill out all details in your BlockE UID profile.',
          reward: 5000,
          completed: profileCompleted,
          checkCompletion: checkProfileCompletion,
        },
        {
          title: 'Use Logout Option',
          description: 'Log out from your profile using the logout option.',
          reward: 100,
          completed: hasLoggedOut,
          checkCompletion: async () => {
            const response = await fetch(`/api/others-data?address=${address}`);
            const data = await response.json();
            return data.loggedOut;
          },
          icon: Logout,
        },
        {
          title: 'Explore BlockE Pages',
          description: 'Visit seven different pages on the BlockE platform.',
          reward: 100,
          completed: visitedPages.length >= 7,
          checkCompletion: async () => {
            const response = await fetch(`/api/others-data?address=${address}`);
            const data = await response.json();
            return data.visitedPages.length >= 7;
          },
          icon: CheckCircle2,
        },
        {
          title: 'Search Dashboard 10 Times',
          description: 'Perform 10 searches on the dashboard page.',
          reward: 100,
          completed: dashboardSearchesCompleted,
          checkCompletion: checkDashboardSearches,
        },
        {
          title: 'Use "Search Connected Address"',
          description: 'Use the "Search Connected Address" button on the dashboard.',
          reward: 100,
          completed: connectedAddressSearchCompleted,
          checkCompletion: checkConnectedAddressSearch,
        },
        {
          title: 'Stake BE Tokens (1 Time)',
          description: 'Stake your BE tokens to earn rewards.',
          reward: 50,
          countThresholds: [1],
          completed: stakingData?.stakeCount >= 1,
          checkCompletion: async () => stakingData?.stakeCount >= 1,
        },
        {
          title: 'Stake BE Tokens (3 Times)',
          description: 'Stake your BE tokens multiple times to earn more rewards.',
          reward: 150,
          countThresholds: [3],
          completed: stakingData?.stakeCount >= 3,
          checkCompletion: async () => stakingData?.stakeCount >= 3,
        },
        {
          title: 'Stake BE Tokens (5 Times)',
          description: 'Become a frequent staker and maximize your rewards.',
          reward: 500,
          countThresholds: [5],
          completed: stakingData?.stakeCount >= 5,
          checkCompletion: async () => stakingData?.stakeCount >= 5,
        },
        {
          title: 'Claim Staking Rewards (1 Time)',
          description: 'Claim your staking rewards to boost your BE balance.',
          reward: 50,
          countThresholds: [1],
          completed: stakingData?.claimCount >= 1,
          checkCompletion: async () => stakingData?.claimCount >= 1,
        },
        {
          title: 'Claim Staking Rewards (3 Times)',
          description: 'Regularly claim your rewards to optimize your earnings.',
          reward: 150,
          countThresholds: [3],
          completed: stakingData?.claimCount >= 3,
          checkCompletion: async () => stakingData?.claimCount >= 3,
        },
        {
          title: 'Claim Staking Rewards (5 Times)',
          description: 'Become a seasoned reward collector and reap the benefits.',
          reward: 500,
          countThresholds: [5],
          completed: stakingData?.claimCount >= 5,
          checkCompletion: async () => stakingData?.claimCount >= 5,
        },
        {
          title: 'Unstake BE Tokens (1 Time)',
          description: 'Unstake your BE tokens when you need them.',
          reward: 50,
          countThresholds: [1],
          completed: stakingData?.unstakeCount >= 1,
          checkCompletion: async () => stakingData?.unstakeCount >= 1,
        },
        {
          title: 'Unstake BE Tokens (3 Times)',
          description: 'Manage your staked tokens flexibly.',
          reward: 150,
          countThresholds: [3],
          completed: stakingData?.unstakeCount >= 3,
          checkCompletion: async () => stakingData?.unstakeCount >= 3,
        },
        {
          title: 'Unstake BE Tokens (5 Times)',
          description: 'Master the art of unstaking and optimize your token management.',
          reward: 500,
          countThresholds: [5],
          completed: stakingData?.unstakeCount >= 5,
          checkCompletion: async () => stakingData?.unstakeCount >= 5,
        },
        {
          title: 'Deposit BE to CW² (1 Time)',
          description: 'Make your first deposit to CW².',
          reward: 100,
          completed: depositCount1,
          checkCompletion: async () => checkCW2Transactions('deposit', 1),
          countThresholds: [1],
        },
        {
          title: 'Deposit BE to CW² (3 Times)',
          description: 'Deposit BE multiple times to CW².',
          reward: 300,
          completed: depositCount3,
          checkCompletion: async () => checkCW2Transactions('deposit', 3),
          countThresholds: [3],
        },
        {
          title: 'Deposit BE to CW² (5 Times)',
          description: 'Become a regular depositor on CW².',
          reward: 500,
          completed: depositCount5,
          checkCompletion: async () => checkCW2Transactions('deposit', 5),
          countThresholds: [5],
        },
        {
          title: 'Withdraw BE from CW² (1 Time)',
          description: 'Make your first withdrawal from CW².',
          reward: 100,
          completed: withdrawCount1,
          checkCompletion: async () => checkCW2Transactions('withdraw', 1),
          countThresholds: [1],
        },
        {
          title: 'Withdraw BE from CW² (3 Times)',
          description: 'Withdraw BE multiple times from CW².',
          reward: 300,
          completed: withdrawCount3,
          checkCompletion: async () => checkCW2Transactions('withdraw', 3),
          countThresholds: [3],
        },
        {
          title: 'Withdraw BE from CW² (5 Times)',
          description: 'Become a seasoned withdrawer on CW².',
          reward: 500,
          completed: withdrawCount5,
          checkCompletion: async () => checkCW2Transactions('withdraw', 5),
          countThresholds: [5],
        },
        {
          title: 'Add 1 Contact',
          description: 'Add your first contact to CW².',
          reward: 10,
          completed: has1Contact,
          checkCompletion: async () => checkContactsCount(1),
        },
        {
          title: 'Add 3 Contacts',
          description: 'Expand your CW² network.',
          reward: 30,
          completed: has3Contacts,
          checkCompletion: async () => checkContactsCount(3),
        },
        {
          title: 'Add 5 Contacts',
          description: 'Connect with more people on CW².',
          reward: 50,
          completed: has5Contacts,
          checkCompletion: async () => checkContactsCount(5),
        },
        {
          title: 'Create 1 Group',
          description: 'Start your first group chat.',
          reward: 150,
          completed: has1Group,
          checkCompletion: async () => checkGroupsCount(1),
        },
        {
          title: 'Create 2 Groups',
          description: 'Create multiple groups for different discussions.',
          reward: 250,
          completed: has2Groups,
          checkCompletion: async () => checkGroupsCount(2),
        },
        {
          title: 'Create 3 Groups',
          description: 'Become a community builder on CW².',
          reward: 350,
          completed: has3Groups,
          checkCompletion: async () => checkGroupsCount(3),
        },
        {
          title: 'Deposit BE to BlockE AI (1 Time)',
          description: 'Deposit BE tokens to your BlockE AI balance.',
          reward: 100,
          completed: depositCount1BEAIT,
          checkCompletion: async () => checkBEAITTransactions('deposit', 1),
        },
        {
          title: 'Deposit BE to BlockE AI (5 Times)',
          description: 'Make multiple deposits to your BlockE AI balance.',
          reward: 500,
          completed: depositCount5BEAIT,
          checkCompletion: async () => checkBEAITTransactions('deposit', 5),
        },
        {
          title: 'Withdraw BE from BlockE AI (1 Time)',
          description: 'Withdraw BE tokens from your BlockE AI balance.',
          reward: 100,
          completed: withdrawCount1BEAIT,
          checkCompletion: async () => checkBEAITTransactions('withdraw', 1),
        },
        {
          title: 'Withdraw BE from BlockE AI (5 Times)',
          description: 'Make multiple withdrawals from your BlockE AI balance.',
          reward: 500,
          completed: withdrawCount5BEAIT,
          checkCompletion: async () => checkBEAITTransactions('withdraw', 5),
        },
        {
          title: 'Talk with BlockE AI (1 Time)',
          description: 'Send your first message to BlockE AI.',
          reward: 10,
          completed: beaiCount1,
          checkCompletion: async () => checkBEAICompletion(1),
        },
        {
          title: 'Talk with BlockE AI (10 Times)',
          description: 'Have multiple conversations with BlockE AI.',
          reward: 100,
          completed: beaiCount10,
          checkCompletion: async () => checkBEAICompletion(10),
        },
        {
          title: 'Talk with BlockE AI (50 Times)',
          description: 'Become a regular BlockE AI user.',
          reward: 500,
          completed: beaiCount50,
          checkCompletion: async () => checkBEAICompletion(50),
        },
        {
          title: 'Submit Newsletter Mail ID',
          description: 'Subscribe to our newsletter for updates and announcements.',
          reward: 100,
          completed: newsletterSignupCompleted,
          checkCompletion: checkNewsletterSignup,
        },
      ]);
    };

    if (isConnected && address) {
      initializeTasks();
    }
  }, [
    isConnected,
    address,
    checkFreeBEMinted,
    checkAutoDisconnectUsage,
    checkThemeUsage,
    checkProfileCompletion,
    checkDashboardSearches,
    checkConnectedAddressSearch,
    checkCW2Transactions,
    stakingData,
    ownedUIDs,
    checkContactsCount,
    checkGroupsCount,
    checkBEAITTransactions, // Add the new dependency
    checkBEAICompletion, // Add the new dependency
    checkNewsletterSignup
  ]);

  useEffect(() => {
    const calculateAirdropBalance = async () => {
      let balance = 0;
      for (const task of tasks) {
        if (task.completed) {
          balance += task.reward;
        }
      }
      setAirdropBalance(balance);
    };

    calculateAirdropBalance();
  }, [tasks]);

  const handleTaskCompletion = async (taskIndex: number) => {
    const updatedTasks = [...tasks];
    const task = updatedTasks[taskIndex];

    try {
      if (task.countThresholds) {
        const count = task.title.includes('Stake')
          ? stakingData.stakeCount
          : task.title.includes('Claim')
          ? stakingData.claimCount
          : stakingData.unstakeCount;

        task.completed = count >= task.countThresholds[0];
      } else {
        updatedTasks[taskIndex].completed = await updatedTasks[taskIndex].checkCompletion();
      }

      if (taskIndex === 0 && updatedTasks[taskIndex].completed && !hasClaimedFreeBE) {
        try {
          if (!address) return
          const provider = new ethers.BrowserProvider(window.ethereum)
          const signer = await provider.getSigner()
          const beTokenContract = new ethers.Contract(BE_TOKEN_ADDRESS, BE_TOKEN_ABI, signer)
          const tx = await beTokenContract.mint()
          await tx.wait()

          // Update hasClaimedFreeBE state
          setHasClaimedFreeBE(true);
        } catch (error: any) {
          console.error('Error minting free BE:', error)
          if (error && error.message) {
            alert(error.message)
          } else {
            alert('Failed to mint BE. Please try again.')
          }
          updatedTasks[taskIndex].completed = false;
          setTasks(updatedTasks);
        }
      }

      // Refetch all tasks after completion check
      const newTasks = await Promise.all(
        tasks.map(async (t, i) => ({
          ...t,
          completed: await t.checkCompletion(),
        }))
      );
      setTasks(newTasks);

      //Recalculate Airdrop balance
      let newBalance = 0;
      for (const task of newTasks) {
        if (task.completed) {
          newBalance += task.reward
        }
      }
      setAirdropBalance(newBalance);
    } catch (error: any) {
      console.error('Error handling task completion:', error);
      if (error && error.message) {
        alert(error.message);
      } else {
        alert('An error occurred. Please try again.');
      }
    }
  };

  const handleClaimAirdrop = async () => {
    if (!address || airdropBalance <= 0) return;

    setIsClaiming(true);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const beTokenContract = new ethers.Contract(BE_TOKEN_ADDRESS, BE_TOKEN_ABI, signer);

      const tx = await beTokenContract.mintForOwner(ethers.parseEther(airdropBalance.toString()));
      setClaimTransaction({ hash: tx.hash, status: 'pending' }); // Set transaction hash and status
      setShowTransactionStatus(true);

      await tx.wait();
      setClaimTransaction({ hash: tx.hash, status: 'success' }); // Update status to success
      setTimeout(() => setShowTransactionStatus(false), 3000); // Hide after 3 seconds
      setAirdropBalance(0);
      await refreshBalance(); // Refresh token balance after claim
    } catch (error: any) {
      console.error('Error claiming airdrop:', error);
      setClaimTransaction({ hash: claimTransaction?.hash || '', status: 'error' }); // Update status to error
      if (error && error.message) {
        alert(error.message);
      } else {
        alert('Failed to claim BE. Please try again.');
      }
    } finally {
      setIsClaiming(false);
    }
  };

  const refreshBalance = async () => {
    if (!address) return;
    try {
      const provider = new ethers.JsonRpcProvider('https://polygon-rpc.com');
      const contract = new ethers.Contract(BE_TOKEN_ADDRESS, BE_TOKEN_ABI, provider);
      const balance = await contract.balanceOf(address);
      setAirdropBalance(Number(ethers.formatUnits(balance, 18)));
    } catch (error) {
      console.error("Error refreshing balance:", error);
    }
  };

  if (!isConnected) {
    return <div>Connect your wallet to participate in the BE airdrop.</div>;
  }

  if (tasks.length === 0) { // Check if tasks are still loading
    return (
      <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/30 backdrop-blur-sm">
        <div className="bg-white rounded-lg p-8 shadow-xl">
          <Loader size={48} className="text-purple-500 mx-auto mb-4 animate-spin" />
          <p className="text-lg text-gray-700">Loading tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex">
      <Sidebar />
      <div className="flex-1 relative">
        <div className="absolute inset-0 z-0">
          <Image
            src="/bedrop.gif"
            alt="BE Drop Background"
            layout="fill"
            objectFit="cover"
            quality={100}
            priority
            className="opacity-40"
          />
        </div>

        <div className="relative z-10 flex flex-col items-center justify-center p-8 mx-auto w-full">
          <div
            className="relative group bg-gradient-to-r from-blockchain-blue via-purple-600 to-pink-500 p-[2px] rounded-2xl mb-8 transition-all duration-300"
            onMouseEnter={() => setShowClaimButton(true)}
            onMouseLeave={() => setShowClaimButton(false)}
          >
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-lg flex items-center gap-4 transition-opacity duration-300 group-hover:opacity-0">
              <div className="w-12 h-12 flex items-center justify-center rounded-full bg-gradient-to-r from-purple-400 to-pink-400">
                <Gift className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-lg font-semibold text-gray-700 dark:text-black">BE Airdrop Balance</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent dark:text-black">
                  {airdropBalance} BE
                </p>
              </div>
            </div>
            <button
              onClick={handleClaimAirdrop}
              disabled={isClaiming}
              className={`absolute inset-0 w-full h-full rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-3 px-6 transition-all duration-300 transform hover:scale-105 group-hover:opacity-100 opacity-0 ${
                isClaiming ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
              }`}
            >
              {isClaiming ? 'Claiming...' : 'Claim'}
            </button>
          </div>

          <button
            onClick={() => {
              // Implement refresh logic here, e.g., refetch data
              console.log('Refresh clicked');
            }}
            className="absolute top-8 right-8 p-2 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white transition-colors"
          >
            <RefreshCw size={24} className="text-gray-600 dark:text-gray-400" />
          </button>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 w-full"> {/* Updated grid columns */}
            {tasks.map((task, index) => (
              <div
                key={task.title}
                className="bg-white/95 dark:bg-gray-800/90 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-purple-200 transform hover:scale-[1.02] transition-transform duration-300 h-[320px] flex flex-col"
              >
                <div className="flex items-center gap-2 mb-4">
                  {task.completed ? (
                    <CheckCircle2 className="text-green-600 w-6 h-6" />
                  ) : (
                    <div className="w-6 h-6 rounded-full border-2 border-gray-300" />
                  )}
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">{task.title}</h3>
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-4">{task.description}</p>
                <p className="text-purple-600 font-medium mb-6">Reward: {task.reward} BE</p>
                <div className="mt-auto"> {/* Added mt-auto div */}
                  <button
                    onClick={() => handleTaskCompletion(index)}
                    disabled={task.completed || (index === 0 && hasClaimedFreeBE)}
                    className={`w-full px-4 py-2 rounded-lg text-white font-medium transition-colors duration-300 ${
                      task.completed
                        ? 'bg-green-500 cursor-default'
                        : index === 0 && !hasClaimedFreeBE
                        ? 'bg-gradient-to-r from-blockchain-blue to-blockchain-purple hover:from-purple-600 hover:to-pink-600'
                        : 'bg-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {task.completed ? 'Completed' : index === 0 ? 'Claim Now' : 'Mint BEUID'}
                  </button>
                </div> {/* Added mt-auto                  </button>
                </div> {/* Added mt-auto div */}
              </div>
            ))}
          </div>
          {showTransactionStatus && claimTransaction && ( // Conditionally render based on showTransactionStatus
            <TransactionStatus
              isProcessing={claimTransaction.status === 'pending'}
              isCompleted={claimTransaction.status === 'success'}
              message={
                claimTransaction.status === 'pending'
                  ? 'Claiming BE...'
                  : claimTransaction.status === 'success'
                  ? 'Claim successful!'
                  : 'Claim failed. Please try again.'
              }
              onClose={() => setClaimTransaction(null)}
              isCornerNotification
            />
          )}
        </div>
      </div>
      <SocialMediaLinks />
    </div>
  );
};

export default withWalletProtection(BEDrop);

