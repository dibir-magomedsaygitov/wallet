import * as Sentry from '@sentry/react-native'
import DeviceInfo from 'react-native-device-info'
import { select } from 'redux-saga/effects'
import { SENTRY_CLIENT_URL } from 'src/config'
import Logger from 'src/utils/Logger'
import { currentAccountSelector } from 'src/web3/selectors'

const TAG = 'sentry/Sentry'

// Set this to true, if you want to test Sentry on dev builds
export const SENTRY_ENABLED = !__DEV__ || false

if (SENTRY_ENABLED) {
  installSentry()
} else {
  Logger.info(TAG, 'Sentry not enabled')
}

// This should be called as early in the lifecycle of the app as possible.
function installSentry() {
  if (!SENTRY_CLIENT_URL) {
    Logger.info(TAG, 'installSentry', 'Sentry URL not found, skiping instalation')
    return
  }
  Sentry.init({
    dsn: SENTRY_CLIENT_URL,
    environment: DeviceInfo.getBundleId(),
    enableAutoSessionTracking: true,
  })
  Logger.info(TAG, 'installSentry', 'Sentry installation complete')
}

// This should not be called at cold start since it can slow down the cold start.
export function* initializeSentryUserContext() {
  const account = yield select(currentAccountSelector)

  if (!account) {
    return
  }
  Logger.debug(
    TAG,
    'initializeSentryUserContext',
    `Setting Sentry user context to account "${account}"`
  )
  Sentry.setUser({
    username: account,
  })
}
