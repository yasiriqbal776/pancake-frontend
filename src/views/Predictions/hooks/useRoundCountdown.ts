import { useGetCurrentRoundBlockNumber, useGetTotalIntervalBlocks } from 'state/hooks'
import useBlockCountdown from 'hooks/useGetBlockCountdown'

/**
 * Returns a countdown in seconds of a given block
 */
const useRoundCountdown = (intervalsToAdd = 1) => {
  const interval = useGetTotalIntervalBlocks()
  const currentRoundBlockNum = useGetCurrentRoundBlockNumber()
  const blocksToAdd = intervalsToAdd * interval
  const seconds = useBlockCountdown(currentRoundBlockNum + blocksToAdd)

  return seconds
}

export default useRoundCountdown
