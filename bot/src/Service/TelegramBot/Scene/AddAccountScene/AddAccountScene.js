import {WizardScene} from "telegraf/scenes";
import {Markup} from "telegraf";
import TelegramBotSceneBase from "../../TelegramBotSceneBase.js";

class AddAccountScene extends TelegramBotSceneBase {

  static id = 'accounts_add';

  async scene() {
    const instance_vars = {};

    return new WizardScene(AddAccountScene.id,
      async (context) => AddAccountScene.selectClientStep(this.service, context),
      async (context) => AddAccountScene.selectSocialServiceStep(this.service, context),
      async (context) => AddAccountScene.selectDolphinProfileStep(this.service, context, instance_vars),
    );
  }

  // @todo Hardcoded clients.
  static async selectClientStep(service, context) {
    await context.reply('Select client', Markup.keyboard(
      ['Dolphin Anty']
    ));

    return context.wizard.next();
  }

  // @todo Hardcoded hosts.
  static async selectSocialServiceStep(service, context) {
    await context.reply('Select social service', Markup.keyboard([
      'Fancentro', 'Fansly', 'Ton'
    ]));

    return context.wizard.next();
  }

  // @todo Hardcoded platforms and client settings.
  static async selectDolphinProfileStep(service, context, vars) {
    if (context.message.text !== 'Fancentro' && context.message.text !== 'Fansly' && context.message.text !== 'Ton') {
      context.wizard.cursor = 1;
      return context.wizard.steps[context.wizard.cursor](context);
    }

    const socialsAgentService = await service.getSocialsAgentService();
    vars.socialAgentAccount = socialsAgentService.getFactory().createAccount({
      client: {
        type: 'dolphin',
        params: {
          authToken: "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIxIiwianRpIjoiODBlOGFjM2E4ZGY1NjZiZjkxYjU2MjU0NjM4NWE4NjI1NjlhMGEwMTE5OTVkZWVlZjNkMWU1YzM3ZjRjN2I1MDQ5NjFiZDA5MTgyMzkyMjIiLCJpYXQiOjE3MjcyOTI1OTcuNjExNTQ1LCJuYmYiOjE3MjcyOTI1OTcuNjExNTQ2LCJleHAiOjE3NTg4Mjg1OTcuNTk2OTYzLCJzdWIiOiIzNzUwNTE0Iiwic2NvcGVzIjpbXX0.cu3orWJhCEn2nqytQXTs7H6_7DhzlcSbZXxOTkbmkOzA_VpVRVuCrU3wtLGl-NSGhdi9yLTaE6Jo5i14NSqJTsUf3j2eWetUoHN3t-XIT_0dcHxFTUD1NvEF0JoJX6CPk05r6AOC7Dw4f10SPGVWbdVct2vJJDuvnWKdWDR8AAsvj-Uszgg8R8u80P1zh1o3OpQ5qSXsl1kHeacj4Nog1ZNKDZ6kGQ-6b1yR8bOItjW_FlIu37pfiiZNzWB6WIs_N7amRB9EAXXAl1AQxLHZHreJ0butYzn6nWIfW-2vvB5ZS8H6nDI-khpzAo4-Qomeg8qPELJmCDEoTbOdaQB-TISFATMGvAI2oYIbVDHpk0GxGGEh4RiM3A181IToypYdsxvsmSYrzgEsybekdQavuVIiVnhLcyNcZJRIfYYFj14pyk_oCwRl12yMUYylFU6q_LN7_Nj-zaEH0jAIHlRWM2gVZCCIgb_-37xgtwT6hOc_JGohhl1p_wIjW-HgJjgP-42l4JAmCcLJBKtVSS6PilGO9tPfldfqgK0Z4fHpBOgJkkpNxcqhlykf91hbU4h85eIqD1UH5bhVdr5608mN1_FC_VRqX8W_RvDskQi47_7Z0lSdj7lL6E-dZ4YJpIYfqc0BTXlXFJb0_uTSIlXFTAQFYSEs-Su7TR_ywbXFI4Y",
          apiUrl: "http://localhost:3001/v1.0",
        }
      },
      platform: {
        name: context.message.text.toLowerCase(),
      }
    })

    let responseKeyboard = [];
    for (const profile of await (await vars.socialAgentAccount.getClient()).fetchProfiles()) {
      responseKeyboard.push(profile.name);
    }

    await context.reply('Select profile', Markup.keyboard(responseKeyboard));
    return context.wizard.next();
  }

}

export default AddAccountScene;