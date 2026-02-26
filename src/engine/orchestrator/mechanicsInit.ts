import { cutMechanic } from './mechanics/cutMechanic';
import { resetMechanic } from './mechanics/resetMechanic';
import { registerMechanic } from './mechanicRegistry';

export function initializeMechanics() {
    registerMechanic('CUT', cutMechanic);
    registerMechanic('RESET', resetMechanic);
}
