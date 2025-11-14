// ...existing code...
import type { NextApiRequest, NextApiResponse } from "next";
import { ethers } from "ethers";
import dotenv from "dotenv";
dotenv.config();

const contractAddress = process.env.CONTRACT_ADDRESS as string;
const usdcDecimals = Number(process.env.USDC_DECIMALS) || 6;

// ABI fragments
const abi = [
  "function getPlanIds() view returns (uint256[])",
  "function getPlan(uint256 planId) view returns (address,uint256,uint256,uint256,bool)",
  "event PlanCreated(uint256 indexed planId, address indexed beneficiary, uint256 totalDeposited, uint256 paymentAmount, uint256 payments)"
];

const format = (value: bigint | number) => Number(value) / 10 ** usdcDecimals;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
    const contract = new ethers.Contract(contractAddress, abi, provider);

    const planIds: bigint[] = await contract.getPlanIds();

    if (!planIds || planIds.length === 0) {
      return res.status(200).json({ plans: [], summary: { totalPlans: 0, activePlans: 0, totalTVL: 0, activeTVL: 0, avgAPY: 0 } });
    }

    let totalTVL = 0n;
    let activeTVL = 0n;
    let totalAPY = 0;
    let activePlans = 0;
    const plans: any[] = [];

    for (const id of planIds) {
      const [beneficiary, paymentAmount, paymentsRemaining, lastPaid, active] = await contract.getPlan(id);
      const payment = (paymentAmount as bigint);
      const months = Number(paymentsRemaining);
      const totalPayout = payment * BigInt(months);

      // total deposit based on 10% markup (from payPension)
      const totalDeposited = (totalPayout * 100n) / 110n;

      totalTVL += totalDeposited;
      if (active) {
        activeTVL += totalDeposited;
        activePlans++;
      }

      // APY calculation (guard divisions)
      let apy = 0;
      const depositedNum = Number(totalDeposited);
      if (depositedNum > 0 && months > 0) {
        const payoutNum = Number(totalPayout);
        const gain = payoutNum - depositedNum;
        const monthlyRate = (gain / depositedNum) / months;
        apy = monthlyRate * 12 * 100;
      }

      totalAPY += apy;

      plans.push({
        id: Number(id),
        beneficiary,
        active: Boolean(active),
        monthlyPayment: format(payment),
        months,
        totalDeposited: format(totalDeposited),
        estimatedAPY: Number(apy.toFixed(2)),
        lastPaid: lastPaid ? String(lastPaid) : null
      });
    }

    const summary = {
      totalPlans: planIds.length,
      activePlans,
      totalTVL: Number(format(totalTVL).toFixed(2)),
      activeTVL: Number(format(activeTVL).toFixed(2)),
      avgAPY: Number((totalAPY / planIds.length).toFixed(2))
    };

    return res.status(200).json({ plans, summary });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: String(err) });
  }
}
// ...existing code...