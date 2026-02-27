import { registerMechanic } from './mechanicRegistry';
import { cutMechanic } from './mechanics/cutMechanic';
import { reprogramMechanic } from './mechanics/reprogramMechanic';
import { systemResetMechanic } from './mechanics/systemResetMechanic';
import { finishCardResolution } from './mechanics/finishCardResolution';

export function initializeMechanics() {
    registerMechanic('CUT', cutMechanic);
    registerMechanic('REPROGRAM', reprogramMechanic);
    registerMechanic('SYSTEM_RESET', systemResetMechanic);
    registerMechanic('FINISH_CARD_RESOLUTION', finishCardResolution);
}
