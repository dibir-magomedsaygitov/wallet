import { fireEvent, render, waitFor } from '@testing-library/react-native'
import { FetchMock } from 'jest-fetch-mock/types'
import * as React from 'react'
import { Text } from 'react-native'
import { Provider } from 'react-redux'
import { PaymentMethod } from 'src/fiatExchanges/FiatExchangeOptions'
import ProviderOptionsScreen, { CicoProvider } from 'src/fiatExchanges/ProviderOptionsScreen'
import { LocalCurrencyCode } from 'src/localCurrency/consts'
import { navigate } from 'src/navigator/NavigationService'
import { Screens } from 'src/navigator/Screens'
import { Currency } from 'src/utils/currencies'
import { navigateToURI } from 'src/utils/linking'
import { createMockStore, getMockStackScreenProps } from 'test/utils'
import { mockAccount } from 'test/values'
import { v4 as uuidv4 } from 'uuid'

const AMOUNT_TO_CASH_IN = 100
const MOCK_IP_ADDRESS = '1.1.1.7'

const mockScreenProps = (
  isCashIn: boolean,
  paymentMethod: PaymentMethod.Card | PaymentMethod.Bank,
  selectedCrypto: Currency = Currency.Dollar
) =>
  getMockStackScreenProps(Screens.ProviderOptionsScreen, {
    isCashIn,
    selectedCrypto,
    amount: {
      crypto: AMOUNT_TO_CASH_IN,
      fiat: AMOUNT_TO_CASH_IN,
    },
    paymentMethod,
  })

const mockStore = createMockStore({
  account: {
    // North Korea country code
    defaultCountryCode: '+850',
  },
  localCurrency: {
    preferredCurrencyCode: LocalCurrencyCode.USD,
  },
  networkInfo: {
    userLocationData: {
      countryCodeAlpha2: 'MX',
      region: null,
      ipAddress: MOCK_IP_ADDRESS,
    },
  },
})

const MOCK_SIMPLEX_QUOTE = {
  user_id: mockAccount,
  quote_id: uuidv4(),
  wallet_id: 'valorapp',
  digital_money: {
    currency: 'CUSD',
    amount: 25,
  },
  fiat_money: {
    currency: 'USD',
    base_amount: 19,
    total_amount: 6,
  },
  valid_until: new Date().toISOString(),
  supported_digital_currencies: ['CUSD', 'CELO'],
}

export const mockProviders: CicoProvider[] = [
  {
    name: 'Simplex',
    restricted: false,
    unavailable: false,
    paymentMethods: [PaymentMethod.Card],
    logo:
      'https://firebasestorage.googleapis.com/v0/b/celo-mobile-mainnet.appspot.com/o/images%2Fsimplex.jpg?alt=media',
    cashIn: true,
    cashOut: false,
    quote: MOCK_SIMPLEX_QUOTE,
  },
  {
    name: 'Moonpay',
    restricted: false,
    paymentMethods: [PaymentMethod.Card, PaymentMethod.Bank],
    url: 'https://www.moonpay.com/',
    logo:
      'https://firebasestorage.googleapis.com/v0/b/celo-mobile-mainnet.appspot.com/o/images%2Fmoonpay.png?alt=media',
    cashIn: true,
    cashOut: false,
    quote: [
      { paymentMethod: PaymentMethod.Bank, digitalAsset: 'cusd', returnedAmount: 95, fiatFee: 5 },
      { paymentMethod: PaymentMethod.Card, digitalAsset: 'cusd', returnedAmount: 90, fiatFee: 10 },
    ],
  },
  {
    name: 'Ramp',
    restricted: false,
    paymentMethods: [PaymentMethod.Card, PaymentMethod.Bank],
    url: 'www.fakewebsite.com',
    logo:
      'https://firebasestorage.googleapis.com/v0/b/celo-mobile-mainnet.appspot.com/o/images%2Framp.png?alt=media',
    quote: [
      { paymentMethod: PaymentMethod.Card, digitalAsset: 'cusd', returnedAmount: 100, fiatFee: 0 },
    ],
    cashIn: true,
    cashOut: false,
  },
  {
    name: 'Xanpool',
    restricted: true,
    paymentMethods: [PaymentMethod.Card, PaymentMethod.Bank],
    url: 'www.fakewebsite.com',
    logo:
      'https://firebasestorage.googleapis.com/v0/b/celo-mobile-mainnet.appspot.com/o/images%2Fxanpool.png?alt=media',
    cashIn: true,
    cashOut: true,
    quote: [
      { paymentMethod: PaymentMethod.Card, digitalAsset: 'cusd', returnedAmount: 97, fiatFee: 3 },
    ],
  },
  {
    name: 'Transak',
    restricted: false,
    unavailable: true,
    paymentMethods: [PaymentMethod.Card, PaymentMethod.Bank],
    url: 'www.fakewebsite.com',
    logo:
      'https://firebasestorage.googleapis.com/v0/b/celo-mobile-mainnet.appspot.com/o/images%2Ftransak.png?alt=media',
    cashIn: true,
    cashOut: false,
    quote: [
      { paymentMethod: PaymentMethod.Bank, digitalAsset: 'cusd', returnedAmount: 94, fiatFee: 6 },
      { paymentMethod: PaymentMethod.Card, digitalAsset: 'cusd', returnedAmount: 88, fiatFee: 12 },
    ],
  },
]

export const mockNoUnrestrictedProviders: CicoProvider[] = [
  {
    name: 'Simplex',
    restricted: true,
    unavailable: false,
    paymentMethods: [PaymentMethod.Card],
    logo:
      'https://firebasestorage.googleapis.com/v0/b/celo-mobile-mainnet.appspot.com/o/images%2Fsimplex.jpg?alt=media',
    cashIn: true,
    cashOut: false,
    quote: MOCK_SIMPLEX_QUOTE,
  },
  {
    name: 'Moonpay',
    restricted: true,
    paymentMethods: [PaymentMethod.Card, PaymentMethod.Bank],
    url: 'https://www.moonpay.com/',
    logo:
      'https://firebasestorage.googleapis.com/v0/b/celo-mobile-mainnet.appspot.com/o/images%2Fmoonpay.png?alt=media',
    cashIn: true,
    cashOut: false,
    quote: [
      { paymentMethod: PaymentMethod.Bank, digitalAsset: 'cusd', returnedAmount: 95, fiatFee: 5 },
      { paymentMethod: PaymentMethod.Card, digitalAsset: 'cusd', returnedAmount: 90, fiatFee: 10 },
    ],
  },
  {
    name: 'Ramp',
    restricted: true,
    paymentMethods: [PaymentMethod.Card, PaymentMethod.Bank],
    url: 'www.fakewebsite.com',
    logo:
      'https://firebasestorage.googleapis.com/v0/b/celo-mobile-mainnet.appspot.com/o/images%2Framp.png?alt=media',
    quote: [
      { paymentMethod: PaymentMethod.Card, digitalAsset: 'cusd', returnedAmount: 100, fiatFee: 0 },
    ],
    cashIn: true,
    cashOut: false,
  },
  {
    name: 'Xanpool',
    restricted: true,
    paymentMethods: [PaymentMethod.Card, PaymentMethod.Bank],
    url: 'www.fakewebsite.com',
    logo:
      'https://firebasestorage.googleapis.com/v0/b/celo-mobile-mainnet.appspot.com/o/images%2Fxanpool.png?alt=media',
    cashIn: true,
    cashOut: true,
    quote: [
      { paymentMethod: PaymentMethod.Card, digitalAsset: 'cusd', returnedAmount: 97, fiatFee: 3 },
    ],
  },
  {
    name: 'Transak',
    restricted: true,
    unavailable: true,
    paymentMethods: [PaymentMethod.Card, PaymentMethod.Bank],
    url: 'www.fakewebsite.com',
    logo:
      'https://firebasestorage.googleapis.com/v0/b/celo-mobile-mainnet.appspot.com/o/images%2Ftransak.png?alt=media',
    cashIn: true,
    cashOut: false,
    quote: [
      { paymentMethod: PaymentMethod.Bank, digitalAsset: 'cusd', returnedAmount: 94, fiatFee: 6 },
      { paymentMethod: PaymentMethod.Card, digitalAsset: 'cusd', returnedAmount: 88, fiatFee: 12 },
    ],
  },
]

const MOCK_PROVIDER_FETCH = JSON.stringify(mockProviders)
const MOCK_NO_RESTRICTED_PROVIDER_FETCH = JSON.stringify(mockNoUnrestrictedProviders)

describe('ProviderOptionsScreen', () => {
  const mockFetch = fetch as FetchMock
  beforeEach(() => {
    jest.useRealTimers()
    jest.clearAllMocks()
    mockFetch.resetMocks()
  })

  it('renders correctly when there are providers', async () => {
    mockFetch.mockResponse(MOCK_PROVIDER_FETCH)

    const tree = render(
      <Provider store={mockStore}>
        <ProviderOptionsScreen {...mockScreenProps(true, PaymentMethod.Card)} />
      </Provider>
    )

    expect(tree).toMatchSnapshot()
    await waitFor(() => tree.getByText('pleaseSelectProvider'))
    expect(tree).toMatchSnapshot()
  })

  it('renders correctly when there are not providers', async () => {
    mockFetch.mockResponse(MOCK_NO_RESTRICTED_PROVIDER_FETCH)

    const tree = render(
      <Provider store={mockStore}>
        <ProviderOptionsScreen {...mockScreenProps(true, PaymentMethod.Card)} />
      </Provider>
    )

    await waitFor(() => tree.getByTestId('noProviders'))
    expect(tree).toMatchSnapshot()

    tree.rerender(
      <Provider store={mockStore}>
        <ProviderOptionsScreen {...mockScreenProps(true, PaymentMethod.Card, Currency.Euro)} />
      </Provider>
    )

    await waitFor(() => tree.getByTestId('noProviders'))
    expect(tree).toMatchSnapshot()
  })

  it('navigates to the Support screen if button is pressed when there are no providers', async () => {
    mockFetch.mockResponse(MOCK_NO_RESTRICTED_PROVIDER_FETCH)

    const tree = render(
      <Provider store={mockStore}>
        <ProviderOptionsScreen {...mockScreenProps(true, PaymentMethod.Card)} />
      </Provider>
    )

    await waitFor(() => tree.getByTestId('noProviders'))
    const switchCurrencyElement = tree.queryByTestId('SwitchCurrency')
    expect(switchCurrencyElement).toBeFalsy()

    fireEvent.press(tree.getByTestId('ContactSupport'))
    expect(navigate).toHaveBeenCalledWith(Screens.SupportContact)
  })

  it('navigates to the FiatOptions screen if button is pressed when there are no providers', async () => {
    const isCashIn = true
    mockFetch.mockResponse(MOCK_NO_RESTRICTED_PROVIDER_FETCH)

    const tree = render(
      <Provider store={mockStore}>
        <ProviderOptionsScreen {...mockScreenProps(isCashIn, PaymentMethod.Card, Currency.Euro)} />
      </Provider>
    )

    await waitFor(() => tree.getByTestId('noProviders'))
    fireEvent.press(tree.getByTestId('SwitchCurrency'))
    expect(navigate).toHaveBeenCalledWith(Screens.FiatExchangeOptions, { isCashIn })
  })

  it('opens Simplex correctly', async () => {
    mockFetch.mockResponse(MOCK_PROVIDER_FETCH)

    const tree = render(
      <Provider store={mockStore}>
        <ProviderOptionsScreen {...mockScreenProps(true, PaymentMethod.Card)} />
      </Provider>
    )

    await waitFor(() => tree.getByText('pleaseSelectProvider'))

    fireEvent.press(tree.getByTestId('Provider/Simplex'))
    expect(navigate).toHaveBeenCalledWith(Screens.Simplex, {
      simplexQuote: MOCK_SIMPLEX_QUOTE,
      userIpAddress: MOCK_IP_ADDRESS,
    })
  })

  it('opens a non-integrated provider correctly', async () => {
    mockFetch.mockResponse(MOCK_PROVIDER_FETCH)

    const tree = render(
      <Provider store={mockStore}>
        <ProviderOptionsScreen {...mockScreenProps(true, PaymentMethod.Card)} />
      </Provider>
    )

    await waitFor(() => tree.getByText('pleaseSelectProvider'))

    fireEvent.press(tree.getByTestId('Provider/Moonpay'))
    expect(navigateToURI).toHaveBeenCalledWith(mockProviders[1].url)
  })

  it('moves available providers to the top of the list', async () => {
    mockFetch.mockResponse(MOCK_PROVIDER_FETCH)

    const tree = render(
      <Provider store={mockStore}>
        <ProviderOptionsScreen {...mockScreenProps(true, PaymentMethod.Card)} />
      </Provider>
    )

    await waitFor(() => tree.getByText('pleaseSelectProvider'))

    const elements = tree.UNSAFE_queryAllByType(Text)
    // The first text element is the info, the second text element is the first provider
    expect(elements[1].props.children).toEqual('Simplex')
  })

  it('moves unavailable providers to the bottom of the list', async () => {
    mockFetch.mockResponse(MOCK_PROVIDER_FETCH)

    const tree = render(
      <Provider store={mockStore}>
        <ProviderOptionsScreen {...mockScreenProps(true, PaymentMethod.Card)} />
      </Provider>
    )

    await waitFor(() => tree.getByText('pleaseSelectProvider'))

    const elements = tree.UNSAFE_queryAllByType(Text)
    // The last few text elements belong to the modal + subtext for the last provider
    const lastProviderName = elements[elements.length - 7].props.children
    expect(lastProviderName).toEqual('Transak')
  })

  it('disables a provider if they are unavailable', async () => {
    mockFetch.mockResponse(MOCK_PROVIDER_FETCH)

    const tree = render(
      <Provider store={mockStore}>
        <ProviderOptionsScreen {...mockScreenProps(true, PaymentMethod.Card)} />
      </Provider>
    )

    await waitFor(() => tree.getByText('pleaseSelectProvider'))

    const elements = tree.queryAllByText('providerUnavailable')
    expect(elements).toHaveLength(1)
    fireEvent.press(tree.getByTestId('Provider/Transak'))
    expect(navigateToURI).not.toHaveBeenCalled()
  })

  it('hides a provider if a user region is restricted', async () => {
    mockFetch.mockResponse(MOCK_PROVIDER_FETCH)

    const tree = render(
      <Provider store={mockStore}>
        <ProviderOptionsScreen {...mockScreenProps(true, PaymentMethod.Card)} />
      </Provider>
    )

    await waitFor(() => tree.getByText('pleaseSelectProvider'))

    const xanpoolElement = tree.queryByText('Xanpool')
    const simplexElement = tree.queryByText('Simplex')
    // Only Xanpool is restricted in mock
    expect(xanpoolElement).toBeFalsy()
    expect(simplexElement).toBeTruthy()
  })

  it('shows a warning if the selected payment method is not supported', async () => {
    mockFetch.mockResponse(MOCK_PROVIDER_FETCH)

    const tree = render(
      <Provider store={mockStore}>
        <ProviderOptionsScreen {...mockScreenProps(true, PaymentMethod.Bank)} />
      </Provider>
    )

    await waitFor(() => tree.getByText('pleaseSelectProvider'))

    const elements = tree.queryAllByText(/unsupportedPaymentMethod/)
    // Only Simplex doesn't support bank accounts
    expect(elements).toHaveLength(1)
  })

  it(`shows "Free" if there is no fee associated with CICO `, async () => {
    mockFetch.mockResponse(MOCK_PROVIDER_FETCH)

    const tree = render(
      <Provider store={mockStore}>
        <ProviderOptionsScreen {...mockScreenProps(true, PaymentMethod.Card, Currency.Dollar)} />
      </Provider>
    )

    await waitFor(() => tree.getByText('pleaseSelectProvider'))

    const freeElement = tree.queryByText('global:free')
    expect(freeElement).toBeTruthy()
  })
})
