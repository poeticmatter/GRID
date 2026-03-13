import { registerMechanic } from './mechanicRegistry';
import { runMechanic } from './mechanics/runMechanic';
import { reprogramMechanic } from './mechanics/reprogramMechanic';
import { systemResetMechanic } from './mechanics/systemResetMechanic';
import { finishCardResolution } from './mechanics/finishCardResolution';
import { endTurnMechanic } from './mechanics/endTurnMechanic';

export function initializeMechanics() {
    registerMechanic('RUN', runMechanic);
    registerMechanic('REPROGRAM', reprogramMechanic);
    registerMechanic('SYSTEM_RESET', systemResetMechanic);
    registerMechanic('FINISH_CARD_RESOLUTION', finishCardResolution);
    registerMechanic('END_TURN', endTurnMechanic);
}
