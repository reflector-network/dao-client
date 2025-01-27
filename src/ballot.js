/**
 * @typedef {'Draft'|'Accepted'|'Rejected'|'Retracted'} BallotStatus
 */
/**
 * @typedef {'AddNode'|'AddPriceFeed'|'Rejected'|'Retracted'} BallotCategory
 */

/*export const BallotStatus = {
    Draft: 0,
    Accepted: 1,
    Rejected: 2,
    Retracted: 3
}

export enum BallotCategory {
    AddNode = 0,
    AddPriceFeed = 1,
    AddAsset = 2,
    General = 3,
}*/


/**
 * @typedef {Object} BallotInitParams
 * @property {BallotCategory} - Ballot type
 * @property {string} - Short title
 * @property {string} - Description text or URL
 * @property {string} - Initiator account address
 */

/**
 * Ballot registered in DAO contract
 */
export default class Ballot {
    constructor(props) {
        Object.assign(this, props)
    }

    /**
     * Current status
     * @type {BallotStatus}
     */
    status
    /**
     * Ballot type
     * @type {BallotCategory}
     */
    category
    /**
     * Short title
     * @type {string}
     */
    title
    /**
     * Description text or URL
     * @type {string}
     */
    description
    /**
     * Address of the initiator account
     * @type {string}
     */
    initiator
    /**
     * Deposited DAO tokens amount
     * @type {bigint}
     */
    deposit
    /**
     * Creation timestamp
     * @type {bigint}
     */
    created
}