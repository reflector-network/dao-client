import {Networks, StrKey} from '@stellar/stellar-sdk'
import {processSimulationErrors} from './errors.js'
import ContractClient from './contract-client.js'
import Ballot from './ballot.js'

export default class DaoClient {
    /**
     * @param {ClientInitializationParams} params
     */
    constructor(params) {
        const options = {
            publicKey: params.publicKey,
            signTransaction: params.signTransaction,
            rpcUrl: params.rpcUrl,
            networkPassphrase: params.networkPassphrase || Networks.PUBLIC,
            contractId: params.contractId || 'CBQSUF57OYX4RIMCZV62DKN6JFOTEKPHIZASMJYOUOCNHGNG2P3XQLSE'
        }
        this.client = new ContractClient(options)
    }

    /**
     * Sets the deposit amount requirements for each ballot category.
     * Requires quorum consensus.
     * @param {Object.<BallotCategory,bigint>} params - Map of deposit amounts for each ballot category
     * @return {Promise<void>}
     * @throws {Error} If the caller doesn't match admin address
     * @throws {Error} If the deposit amount is invalid
     * @throws {Error} If the deposit amount is not set for some categories
     */
    async setDeposit(params) {
        const tx = await this.client.set_deposit({deposit_params: params})
        processSimulationErrors(tx)
        await tx.signAndSend()
    }

    /**
     * Unlocks tokens distributed to operators and developer organization on a weekly basis.
     * Requires quorum consensus.
     * @param {string} developer - Account address of developer organization
     * @param {string[]} operators - List of account addresses of quorum operators
     * @return {Promise<void>}
     * @throws {Error} If the caller doesn't match admin address
     * @throws {Error} If the unlock process has been initiated too early
     */
    async unlock(developer, operators) {
        if (!StrKey.isValidEd25519PublicKey(developer))
            throw new Error('Invalid developer address')
        if (!(operators instanceof Array) || operators.some(op => !StrKey.isValidEd25519PublicKey(op)))
            throw new Error('Invalid operator address')
        const tx = await this.client.unlock({developer, operators})
        processSimulationErrors(tx)
        await tx.signAndSend()
    }

    /**
     * Unlocks tokens distributed to operators and developer organization on a weekly basis.
     * Requires quorum consensus.
     * @param {string} claimant - Claimant's account
     * @param {string} to - Destination address that will receive claimed tokens
     * @param {bigint} amount - Amount of tokens to claim
     * @return {Promise<void>}
     * @throws {Error} If the caller doesn't match the claimant address
     * @throws {Error} If the claimed amount is larger than the available unlocked amount
     */
    async claim(claimant, to, amount) {
        if (!StrKey.isValidEd25519PublicKey(claimant))
            throw new Error('Invalid claimant address')
        if (to) {
            if (!(StrKey.isValidEd25519PublicKey(to) || StrKey.isValidContract(to)))
                throw new Error('Invalid recipient address')
        } else {
            to = claimant
        }
        if (typeof amount !== 'bigint' || !(amount > 0n))
            throw new Error('Invalid amount')
        const tx = await this.client.claim({claimant, to, amount})
        processSimulationErrors(tx)
        await tx.signAndSend()
    }

    /**
     * Fetches the tokens amount available for a given DAO member
     * @param {string} claimant - Claimant's account address
     * @return {Promise<bigint>} Amount of DAO tokens available to claim
     * @throws {Error} If the caller doesn't match the claimant address
     */
    async available(claimant) {
        if (!StrKey.isValidEd25519PublicKey(claimant))
            throw new Error('Invalid claimant address')
        const tx = await this.client.available({claimant})
        processSimulationErrors(tx)
        return tx.result
    }

    /**
     * Creates a new DAO decision ballot.
     * @param {BallotInitParams} params - Ballot initialization parameters
     * @return {Promise<bigint>} Unique ID of a newly created ballot
     * @throws {Error} If the caller doesn't match the initiator address
     */
    async createBallot(params) {
        const tx = await this.client.create_ballot({params})
        processSimulationErrors(tx)
        const res = await tx.signAndSend()
        return res.result
    }

    /**
     * Retracts the proposal and initiates the deposit refund.
     * @param {bigint} id - Unique ballot ID
     * @return {Promise}
     * @throws {Error} If the caller doesn't match the initiator address
     * @throws {Error} If the ballot is not found
     * @throws {Error} If the ballot status is in invalid state (not Draft or Rejected)
     * @throws {Error} If the voting period is not over
     */
    async retractBallot(id) {
        const tx = await this.client.retract_ballot({ballot_id: id})
        processSimulationErrors(tx)
        await tx.signAndSend()
    }

    /**
     * Fetches the ballot by its unique ID.
     * @param {bigint} id - Unique ballot ID
     * @return {Promise<Ballot>} Requested ballot
     * @throws {Error} If the ballot not found
     */
    async fetchBallot(id) {
        const tx = await this.client.get_ballot({ballot_id: id})
        processSimulationErrors(tx)
        return new Ballot(tx.result)
    }

    /**
     * Unlocks tokens distributed to operators and developer organization on a weekly basis.
     * Sets ballot decision based on the DAO members voting (decision requires majority of signatures)
     * @param {bigint} id - Unique ballot ID
     * @param {boolean} accepted - Whether the proposal has been accepted or rejected by the majority of DAO members
     * @return {Promise<void>}
     * @throws {Error} If the caller doesn't match admin address
     * @throws {Error} If the ballot status is not Draft
     * @throws {Error} If the ballot is not found
     */
    async vote(id, accepted) {
        const tx = await this.client.vote({ballot_id: id, accepted})
        processSimulationErrors(tx)
        await tx.signAndSend()
    }
}

/**
 * @typedef {{}} ClientInitializationParams
 * @property {string} publicKey - Public key of the account that will interact with the contract
 * @property {SignTransactionCallback} signTransaction - Callback for signing transactions generated by the client
 * @property {string} rpcUrl - URL of the RPC server
 */

/**
 * @callback SignTransactionCallback - Callback for signing transactions generated by the client
 * @param {string} tx - Transaction XDR to sign
 * @param {{network: string, networkPassphrase: string, accountToSign: string}} context - Signing context
 * @return {Promise<{signedTxXdr: string, [signerAddress]: string}>} - Signed transaction response
 */