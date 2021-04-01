import React, { ReactElement } from 'react'
import { Flex, Text } from '@pancakeswap-libs/uikit'
import styled from 'styled-components'
import useI18n from 'hooks/useI18n'
import useBlockCountdown from '../../hooks/useGetBlockCountdown'
import { formatRoundTime } from '../../helpers'

type Status = 'expired' | 'live' | 'next' | 'soon'

interface CardHeaderProps {
  status: Status
  title: string
  epoch: number
  blockNumber: number
  icon?: ReactElement
}

const getBackgroundColor = (status: Status) => {
  switch (status) {
    case 'live':
      return 'transparent'
    case 'next':
      return 'secondary'
    case 'expired':
    case 'soon':
    default:
      return 'borderColor'
  }
}

type TextColor = 'textDisabled' | 'white' | 'secondary' | 'text' | 'textSubtle'
type FallbackColor = 'text' | 'textSubtle'

const getTextColorByStatus = (status: Status, fallback: FallbackColor): TextColor => {
  switch (status) {
    case 'expired':
      return 'textDisabled'
    case 'next':
      return 'white'
    case 'live':
      return 'secondary'
    default:
      return fallback
  }
}

const StyledCardHeader = styled.div<{ status: Status }>`
  align-item: center;
  background-color: ${({ theme, status }) => theme.colors[getBackgroundColor(status)]};
  border-radius: 16px 16px 0 0;
  display: grid;
  grid-template-columns: 1fr 40px 1fr;
  padding: ${({ status }) => (status === 'live' ? '16px' : '8px')};
`

const Time = styled(Text).attrs({ fontSize: '12px' })<{ borderColor: TextColor }>`
  border-bottom: 1px dotted ${({ theme, borderColor }) => theme.colors[borderColor]};
`

const CardHeader: React.FC<CardHeaderProps> = ({ status, title, epoch, blockNumber, icon }) => {
  const TranslateString = useI18n()
  const textColor = getTextColorByStatus(status, 'text')
  const seconds = useBlockCountdown(blockNumber)
  const countdown = formatRoundTime(seconds)
  const isLive = status === 'live'
  const timePrefix = seconds > 0 ? TranslateString(999, 'Start') : TranslateString(999, 'End')

  return (
    <StyledCardHeader status={status}>
      <Flex alignItems="center">
        {icon}
        <Text color={textColor} bold={isLive} textTransform={isLive ? 'uppercase' : 'capitalize'} lineHeight="21px">
          {title}
        </Text>
      </Flex>
      <Flex alignItems="center">
        <Text fontSize={isLive ? '14px' : '12px'} color={getTextColorByStatus(status, 'textSubtle')} textAlign="center">
          {`#${epoch}`}
        </Text>
      </Flex>
      <Flex alignItems="center" justifyContent="end">
        <Time color={textColor} borderColor={textColor}>{`${timePrefix}: ~${countdown}`}</Time>
      </Flex>
    </StyledCardHeader>
  )
}

export default CardHeader
