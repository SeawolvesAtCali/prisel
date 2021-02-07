export enum MoneyExchangeDirection {
    UNSPECIFIED,
    TO_ALL_OTHER_PLAYERS,
    FROM_ALL_OTHER_PLAYERS,
    FROM_BANK,
    TO_BANK,
}

export enum MoneyExchangeType {
    DEFAULT, // the default, plain fixed amount exchange
    OWN_PROPERTY_PER_HUNDRED, // based on total worth of owned properties. For every hundred of worth, pay the amount.
}
