import { useCallback, useEffect, useMemo, useRef } from 'react'
import BigNumber from 'bignumber.js'
import { kebabCase } from 'lodash'
import { useWeb3React } from '@web3-react/core'
import { Toast, toastTypes } from '@pancakeswap-libs/uikit'
import { useSelector, useDispatch } from 'react-redux'
import { Team } from 'config/constants/types'
import { getWeb3NoAccount } from 'utils/web3'
import useRefresh from 'hooks/useRefresh'
import {
  fetchFarmsPublicDataAsync,
  fetchPoolsPublicDataAsync,
  fetchPoolsUserDataAsync,
  push as pushToast,
  remove as removeToast,
  clear as clearToast,
  setBlock,
} from './actions'
import {
  State,
  Farm,
  Pool,
  Block,
  ProfileState,
  TeamsState,
  AchievementState,
  PriceState,
  RoundData,
  StreamData,
  TokenPair,
  TickerData,
  TickerStream,
} from './types'
import { fetchProfile } from './profile'
import { fetchTeam, fetchTeams } from './teams'
import { fetchAchievements } from './achievements'
import { fetchPrices } from './prices'
import { initializePredictions } from './predictions'
import { transformRoundResponse } from './predictions/helpers'
import { setConnectedStatus, setTokenPair } from './ticker'

export const useFetchPublicData = () => {
  const dispatch = useDispatch()
  const { slowRefresh } = useRefresh()
  useEffect(() => {
    dispatch(fetchFarmsPublicDataAsync())
    dispatch(fetchPoolsPublicDataAsync())
  }, [dispatch, slowRefresh])

  useEffect(() => {
    const web3 = getWeb3NoAccount()
    const interval = setInterval(async () => {
      const blockNumber = await web3.eth.getBlockNumber()
      dispatch(setBlock(blockNumber))
    }, 6000)

    return () => clearInterval(interval)
  }, [dispatch])
}

// Farms

export const useFarms = (): Farm[] => {
  const farms = useSelector((state: State) => state.farms.data)
  return farms
}

export const useFarmFromPid = (pid): Farm => {
  const farm = useSelector((state: State) => state.farms.data.find((f) => f.pid === pid))
  return farm
}

export const useFarmFromSymbol = (lpSymbol: string): Farm => {
  const farm = useSelector((state: State) => state.farms.data.find((f) => f.lpSymbol === lpSymbol))
  return farm
}

export const useFarmUser = (pid) => {
  const farm = useFarmFromPid(pid)

  return {
    allowance: farm.userData ? new BigNumber(farm.userData.allowance) : new BigNumber(0),
    tokenBalance: farm.userData ? new BigNumber(farm.userData.tokenBalance) : new BigNumber(0),
    stakedBalance: farm.userData ? new BigNumber(farm.userData.stakedBalance) : new BigNumber(0),
    earnings: farm.userData ? new BigNumber(farm.userData.earnings) : new BigNumber(0),
  }
}

// Pools

export const usePools = (account): Pool[] => {
  const { fastRefresh } = useRefresh()
  const dispatch = useDispatch()
  useEffect(() => {
    if (account) {
      dispatch(fetchPoolsUserDataAsync(account))
    }
  }, [account, dispatch, fastRefresh])

  const pools = useSelector((state: State) => state.pools.data)
  return pools
}

export const usePoolFromPid = (sousId): Pool => {
  const pool = useSelector((state: State) => state.pools.data.find((p) => p.sousId === sousId))
  return pool
}

// Toasts
export const useToast = () => {
  const dispatch = useDispatch()
  const helpers = useMemo(() => {
    const push = (toast: Toast) => dispatch(pushToast(toast))

    return {
      toastError: (title: string, description?: string) => {
        return push({ id: kebabCase(title), type: toastTypes.DANGER, title, description })
      },
      toastInfo: (title: string, description?: string) => {
        return push({ id: kebabCase(title), type: toastTypes.INFO, title, description })
      },
      toastSuccess: (title: string, description?: string) => {
        return push({ id: kebabCase(title), type: toastTypes.SUCCESS, title, description })
      },
      toastWarning: (title: string, description?: string) => {
        return push({ id: kebabCase(title), type: toastTypes.WARNING, title, description })
      },
      push,
      remove: (id: string) => dispatch(removeToast(id)),
      clear: () => dispatch(clearToast()),
    }
  }, [dispatch])

  return helpers
}

// Profile

export const useFetchProfile = () => {
  const { account } = useWeb3React()
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(fetchProfile(account))
  }, [account, dispatch])
}

export const useProfile = () => {
  const { isInitialized, isLoading, data, hasRegistered }: ProfileState = useSelector((state: State) => state.profile)
  return { profile: data, hasProfile: isInitialized && hasRegistered, isInitialized, isLoading }
}

// Teams

export const useTeam = (id: number) => {
  const team: Team = useSelector((state: State) => state.teams.data[id])
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(fetchTeam(id))
  }, [id, dispatch])

  return team
}

export const useTeams = () => {
  const { isInitialized, isLoading, data }: TeamsState = useSelector((state: State) => state.teams)
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(fetchTeams())
  }, [dispatch])

  return { teams: data, isInitialized, isLoading }
}

// Achievements

export const useFetchAchievements = () => {
  const { account } = useWeb3React()
  const dispatch = useDispatch()

  useEffect(() => {
    if (account) {
      dispatch(fetchAchievements(account))
    }
  }, [account, dispatch])
}

export const useAchievements = () => {
  const achievements: AchievementState['data'] = useSelector((state: State) => state.achievements.data)
  return achievements
}

// Prices
export const useFetchPriceList = () => {
  const { slowRefresh } = useRefresh()
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(fetchPrices())
  }, [dispatch, slowRefresh])
}

export const useGetApiPrices = () => {
  const prices: PriceState['data'] = useSelector((state: State) => state.prices.data)
  return prices
}

export const useGetApiPrice = (token: string) => {
  const prices = useGetApiPrices()

  if (!prices) {
    return null
  }

  return prices[token.toLowerCase()]
}

export const usePriceCakeBusd = (): BigNumber => {
  const ZERO = new BigNumber(0)
  const cakeBnbFarm = useFarmFromPid(1)
  const bnbBusdFarm = useFarmFromPid(2)

  const bnbBusdPrice = bnbBusdFarm.tokenPriceVsQuote ? new BigNumber(1).div(bnbBusdFarm.tokenPriceVsQuote) : ZERO
  const cakeBusdPrice = cakeBnbFarm.tokenPriceVsQuote ? bnbBusdPrice.times(cakeBnbFarm.tokenPriceVsQuote) : ZERO

  return cakeBusdPrice
}

// Block
export const useBlock = () => {
  return useSelector((state: State) => state.block)
}

export const useInitialBlock = () => {
  return useSelector((state: State) => state.block.initialBlock)
}

// Predictions
export const useIsHistoryPaneOpen = () => {
  return useSelector((state: State) => state.predictions.isHistoryPaneOpen)
}

export const useIsChartPaneOpen = () => {
  return useSelector((state: State) => state.predictions.isChartPaneOpen)
}

export const useInitializePredictions = () => {
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(initializePredictions())
  }, [dispatch])
}

export const useGetRounds = () => {
  const rounds = useSelector((state: State) => state.predictions.rounds)

  return useMemo<RoundData>(() => {
    return Object.keys(rounds).reduce((accum, epoch) => {
      return {
        ...accum,
        [epoch]: transformRoundResponse(rounds[epoch]),
      }
    }, {})
  }, [rounds])
}

export const useGetCurrentEpoch = () => {
  return useSelector((state: State) => state.predictions.currentEpoch)
}

export const useIsNextRound = (epoch: number) => {
  const currentEpoch = useGetCurrentEpoch()
  return epoch === currentEpoch + 1
}

export const useGetLiveRound = () => {
  const { currentEpoch, rounds } = useSelector((state: State) => state.predictions)
  return rounds[currentEpoch]
}

export const useGetPredictionsStatus = () => {
  return useSelector((state: State) => state.predictions.status)
}

export const useGetCurrentRound = () => {
  const currentEpoch = useGetCurrentEpoch()
  const roundData = useSelector((state: State) => state.predictions.rounds)
  return roundData[currentEpoch]
}

// Ticker
export const useGetTokenPairConnectionStatus = (tokenPair: TokenPair) => {
  const tokenPairData: TickerData = useSelector((state: State) => state.ticker[tokenPair])

  if (tokenPairData === undefined) {
    return false
  }

  return tokenPairData.isConnected
}

export const useGetTokenPairData = (tokenPair: TokenPair): TickerStream => {
  return useSelector((state: State) => state.ticker.data[tokenPair]?.data)
}

export const useTokenPairTicker = (tokenPair: TokenPair, connectOnMount: boolean) => {
  const websocket = useRef<WebSocket>(null)
  const stream = useGetTokenPairData(tokenPair)
  const tokenPairConnectionStatus = useGetTokenPairConnectionStatus(tokenPair)
  const dispatch = useDispatch()

  const connect = useCallback(() => {
    websocket.current.onmessage = (evt) => {
      try {
        const data = JSON.parse(evt.data) as StreamData
        dispatch(
          setTokenPair({
            tokenPair,
            data: {
              eventType: data.e,
              eventTime: data.E,
              symbol: data.s,
              priceChange: parseFloat(data.p),
              priceChangePercent: parseFloat(data.P),
              weightAveragePrice: parseFloat(data.w),
              firstTrade: parseFloat(data.x),
              lastPrice: parseFloat(data.c),
              lastQuantity: Number(data.Q),
              bestBidPrice: parseFloat(data.b),
              bestBidQuantity: Number(data.B),
              bestAskPrice: parseFloat(data.a),
              bestAskQuantity: Number(data.A),
              openPrice: parseFloat(data.o),
              highPrice: parseFloat(data.h),
              lowPrice: parseFloat(data.l),
              totalTradedBaseAssetVolume: Number(data.v),
              totalTradedQuoteAssetVolume: Number(data.q),
              statisticsOpenTime: Number(data.O),
              statisticsCloseTime: Number(data.C),
              firstTradeId: Number(data.F),
              lastTradeId: Number(data.L),
              totalNumberOfTrades: Number(data.n),
            },
          }),
        )
      } catch (error) {
        console.error(`Error parsing data from stream`, error)
      }
    }
  }, [tokenPair, websocket, dispatch])

  const disconnect = useCallback(() => {
    websocket.current.close()
  }, [websocket])

  useEffect(() => {
    let ws: WebSocket

    // Only make a new connection if we need
    if (!tokenPairConnectionStatus) {
      ws = new WebSocket(`wss://stream.binance.com:9443/ws/streams/${tokenPair}@ticker`)

      ws.onopen = () => {
        dispatch(setConnectedStatus({ tokenPair, status: true }))
      }

      ws.onclose = () => {
        dispatch(setConnectedStatus({ tokenPair, status: false }))
      }

      websocket.current = ws

      if (connectOnMount) {
        connect()
      }
    }

    return () => {
      ws.close()
    }
  }, [tokenPair, tokenPairConnectionStatus, websocket, connect, connectOnMount, dispatch])

  return { stream, connect, disconnect }
}

// Token pair helpers
export const useBnbUsdtTicker = (connectOnMount = true) => {
  return useTokenPairTicker(TokenPair.BNBUSDT, connectOnMount)
}
