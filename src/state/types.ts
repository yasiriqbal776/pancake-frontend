import { Toast } from '@pancakeswap-libs/uikit'
import BigNumber from 'bignumber.js'
import { CampaignType, FarmConfig, Nft, PoolConfig, Team } from 'config/constants/types'

export type TranslatableText =
  | string
  | {
      id: number
      fallback: string
      data?: {
        [key: string]: string | number
      }
    }

export interface Farm extends FarmConfig {
  tokenAmount?: BigNumber
  quoteTokenAmount?: BigNumber
  lpTotalInQuoteToken?: BigNumber
  tokenPriceVsQuote?: BigNumber
  poolWeight?: BigNumber
  userData?: {
    allowance: BigNumber
    tokenBalance: BigNumber
    stakedBalance: BigNumber
    earnings: BigNumber
  }
}

export interface Pool extends PoolConfig {
  totalStaked?: BigNumber
  startBlock?: number
  endBlock?: number
  userData?: {
    allowance: BigNumber
    stakingTokenBalance: BigNumber
    stakedBalance: BigNumber
    pendingReward: BigNumber
  }
}

export interface Profile {
  userId: number
  points: number
  teamId: number
  nftAddress: string
  tokenId: number
  isActive: boolean
  username: string
  nft?: Nft
  team: Team
  hasRegistered: boolean
}

// Slices states

export interface ToastsState {
  data: Toast[]
}

export interface FarmsState {
  data: Farm[]
}

export interface PoolsState {
  data: Pool[]
}

export interface ProfileState {
  isInitialized: boolean
  isLoading: boolean
  hasRegistered: boolean
  data: Profile
}

export type TeamResponse = {
  0: string
  1: string
  2: string
  3: string
  4: boolean
}

export type TeamsById = {
  [key: string]: Team
}

export interface TeamsState {
  isInitialized: boolean
  isLoading: boolean
  data: TeamsById
}

export interface Achievement {
  id: string
  type: CampaignType
  address: string
  title: TranslatableText
  description?: TranslatableText
  badge: string
  points: number
}

export interface AchievementState {
  data: Achievement[]
}

// API Price State
export interface PriceList {
  [key: string]: number
}

export interface PriceApiResponse {
  /* eslint-disable camelcase */
  update_at: string
  prices: PriceList
}

export interface PriceState {
  isLoading: boolean
  lastUpdated: string
  data: PriceList
}

// Block

export interface BlockState {
  currentBlock: number
  initialBlock: number
}

// Predictions

export enum BetPosition {
  BULL = 'Bull',
  BEAR = 'Bear',
}

export enum PredictionStatus {
  INITIAL = 'initial',
  LIVE = 'live',
  PAUSED = 'paused',
}

export interface Round {
  id: string
  epoch: number
  startBlock: number
  lockAt: number | null
  lockBlock: number | null
  lockPrice: number | null
  endBlock: number | null
  closePrice: number | null
  totalBets: number
  totalAmount: number
  bullBets: number
  bearAmount: number
  bullAmount: number
  bets?: Bet[]
}

export interface Bet {
  id: string
  hash: string
  amount: number
  position: BetPosition
  claimed: boolean
  user: PredictionUser
}

export interface PredictionUser {
  id: string
  address: string
  block: number
  totalBets: number
  totalBNB: number
}

export interface RoundData {
  [key: string]: Round
}

export interface PredictionsState {
  status: PredictionStatus
  isLoading: boolean
  isHistoryPaneOpen: boolean
  isChartPaneOpen: boolean
  currentEpoch: number
  currentRoundStartBlockNumber: number
  intervalBlocks: number
  bufferBlocks: number
  minBetAmount: string
  rounds: RoundData
}

// Global state

export interface State {
  achievements: AchievementState
  block: BlockState
  farms: FarmsState
  prices: PriceState
  pools: PoolsState
  predictions: PredictionsState
  profile: ProfileState
  teams: TeamsState
  toasts: ToastsState
}
