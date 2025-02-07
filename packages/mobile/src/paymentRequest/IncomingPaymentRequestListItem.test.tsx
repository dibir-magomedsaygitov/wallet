import { fireEvent, render } from '@testing-library/react-native'
import BigNumber from 'bignumber.js'
import * as React from 'react'
import 'react-native'
import { Provider } from 'react-redux'
import { SendOrigin } from 'src/analytics/types'
import { TokenTransactionType } from 'src/apollo/types'
import { AddressValidationType } from 'src/identity/reducer'
import { navigate } from 'src/navigator/NavigationService'
import { Screens } from 'src/navigator/Screens'
import IncomingPaymentRequestListItem from 'src/paymentRequest/IncomingPaymentRequestListItem'
import { Currency } from 'src/utils/currencies'
import { createMockStore } from 'test/utils'
import { mockE164Number, mockInvitableRecipient } from 'test/values'

const props = {
  id: '1',
  amount: '24',
  comment: 'Hey thanks for the loan, Ill pay you back ASAP. LOVE YOU',
  requester: mockInvitableRecipient,
}

const mockTransactionData = {
  recipient: props.requester,
  amount: new BigNumber(props.amount),
  currency: Currency.Dollar,
  reason: props.comment,
  type: TokenTransactionType.PayRequest,
  firebasePendingRequestUid: props.id,
}

describe('IncomingPaymentRequestListItem', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders correctly', () => {
    const store = createMockStore()

    const tree = render(
      <Provider store={store}>
        <IncomingPaymentRequestListItem {...props} />
      </Provider>
    )

    expect(tree).toMatchSnapshot()
  })

  it('displays the loading animation while fetching addresses', () => {
    const store = createMockStore()

    const tree = render(
      <Provider store={store}>
        <IncomingPaymentRequestListItem {...props} />
      </Provider>
    )
    fireEvent.press(tree.getByText('global:send'))
    expect(tree.queryByTestId('loading/paymentRequest')).not.toBeNull()
  })

  it('navigates to send confirmation if there is no validation needed', () => {
    const store = createMockStore({
      identity: {
        secureSendPhoneNumberMapping: {
          [mockE164Number]: {
            addressValidationType: AddressValidationType.NONE,
            isFetchingAddresses: true,
            lastFetchSuccessful: true,
          },
        },
      },
    })

    const tree = render(
      <Provider store={store}>
        <IncomingPaymentRequestListItem {...props} />
      </Provider>
    )

    fireEvent.press(tree.getByText('global:send'))

    const updatedStore = createMockStore({
      identity: {
        secureSendPhoneNumberMapping: {
          [mockE164Number]: {
            addressValidationType: AddressValidationType.NONE,
            isFetchingAddresses: false,
            lastFetchSuccessful: true,
          },
        },
      },
    })

    tree.rerender(
      <Provider store={updatedStore}>
        <IncomingPaymentRequestListItem {...props} />
      </Provider>
    )

    expect(navigate).toHaveBeenCalledWith(Screens.SendConfirmationLegacy, {
      origin: SendOrigin.AppRequestFlow,
      transactionData: mockTransactionData,
    })
  })

  it('navigates to secure send if there is validation needed', () => {
    const store = createMockStore({
      identity: {
        secureSendPhoneNumberMapping: {
          [mockE164Number]: {
            addressValidationType: AddressValidationType.NONE,
            isFetchingAddresses: true,
            lastFetchSuccessful: true,
          },
        },
      },
    })

    const tree = render(
      <Provider store={store}>
        <IncomingPaymentRequestListItem {...props} />
      </Provider>
    )

    fireEvent.press(tree.getByText('global:send'))

    const updatedStore = createMockStore({
      identity: {
        secureSendPhoneNumberMapping: {
          [mockE164Number]: {
            addressValidationType: AddressValidationType.PARTIAL,
            isFetchingAddresses: false,
            lastFetchSuccessful: true,
          },
        },
      },
    })

    tree.rerender(
      <Provider store={updatedStore}>
        <IncomingPaymentRequestListItem {...props} />
      </Provider>
    )

    expect(navigate).toHaveBeenCalledWith(Screens.ValidateRecipientIntro, {
      origin: SendOrigin.AppRequestFlow,
      transactionData: mockTransactionData,
      addressValidationType: AddressValidationType.PARTIAL,
    })
  })

  it('does not navigate when address fetch is unsuccessful', () => {
    const store = createMockStore({
      identity: {
        secureSendPhoneNumberMapping: {
          [mockE164Number]: {
            addressValidationType: AddressValidationType.NONE,
            isFetchingAddresses: true,
            lastFetchSuccessful: false,
          },
        },
      },
    })

    const tree = render(
      <Provider store={store}>
        <IncomingPaymentRequestListItem {...props} />
      </Provider>
    )

    fireEvent.press(tree.getByText('global:send'))

    const updatedStore = createMockStore({
      identity: {
        secureSendPhoneNumberMapping: {
          [mockE164Number]: {
            addressValidationType: AddressValidationType.PARTIAL,
            isFetchingAddresses: false,
            lastFetchSuccessful: false,
          },
        },
      },
    })

    tree.rerender(
      <Provider store={updatedStore}>
        <IncomingPaymentRequestListItem {...props} />
      </Provider>
    )

    expect(navigate).toBeCalledTimes(0)
  })
})
