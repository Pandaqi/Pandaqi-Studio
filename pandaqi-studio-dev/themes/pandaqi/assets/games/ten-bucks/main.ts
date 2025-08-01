import { SettingType } from "lib/pq-games";

export const CONFIG =
{
    _settings:
    {
        sets:
        {
            type: SettingType.GROUP,

            base:
            {
                type: SettingType.CHECK,
                default: true
            },

            wildWagers:
            {
                type: SettingType.CHECK,
            },

            zeroRisk:
            {
                type: SettingType.CHECK,
            },

            badInvestment:
            {
                type: SettingType.CHECK,
            },

            actionFund:
            {
                type: SettingType.CHECK,
            },

            shoppingSpree:
            {
                type: SettingType.CHECK,
            },
        }
    }
}