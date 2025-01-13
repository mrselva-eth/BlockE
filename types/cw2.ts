import { ObjectId } from 'mongodb'

export interface CW2Action {
  type: 'deposit' | 'withdraw';
  transactionHash: string;
  amount: number;
  timestamp: Date;
}

export interface CW2Data {
  _id: ObjectId;
  userAddress: string;
  depositCount: number;
  withdrawCount: number;
  actions: CW2Action[];
}

