/**
 * Contract-specific error codes
 */
export const ContractErrors = {
    /**
     * The contract is not initialized.
     */
    0: {message: 'NotInitialized'},

    /**
     * Contract has been already initialized earlier
     */
    1: {message: 'AlreadyInitialized'},

    /**
     * Caller is not authorized to perform the operation
     */
    2: {message: 'Unauthorized'},

    /**
     * Operation amount is invalid
     */
    3: {message: 'InvalidAmount'},

    /**
     * Invalid ballot create parameters
     */
    4: {message: 'InvalidBallotParams'},

    /**
     * Overflow occurred during the operation
     */
    5: {message: 'Overflow'},

    /**
     * Operators param is invalid
     */
    6: {message: 'InvalidOperators'},

    /**
     * Last unlock process has been executed less than a week ago
     */
    10: {message: 'UnlockUnavailable'},

    /**
     * Proposal has been created less than two weeks ago and refund is not available yet, or the ballot has been closed
     */
    11: {message: 'RefundUnavailable'},

    /**
     * Ballot with such ID has not been registered or expired
     */
    20: {message: 'BallotNotFound'},

    /**
     * Ballot voting has ended and it cannot be modified
     */
    21: {message: 'BallotClosed'}
}

/**
 * Handle simulation errors if any
 * @param {AssembledTransaction} tx
 * @internal
 */
export function processSimulationErrors(tx) {
    if (tx.simulation.error) {
        const contractErrorMatch = /HostError: Error\(Contract, #(\d+)\)/.exec(tx.simulation.error)
        if (contractErrorMatch) {
            const code = contractErrorMatch[1]
            const err = ContractErrors[code]
            if (err) {
                throw new Error(`Contract execution error: #${code} ${err.message} `)
            }
        }
        throw tx.simulation.error
    }
}