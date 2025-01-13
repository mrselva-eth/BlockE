export interface StakeData {
    transactionHash: string;
    amount: string;
    periodIndex: number;
    startTime: number;
    endTime: number;
    apr: number;
    expectedBE: string;
    claimed: boolean;
    unstaked: boolean;
   }
   
   