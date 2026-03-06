import { CardPool } from '../../data/cards';
import type { CardDefinition, Card } from '../types';

export class CardRegistry {
    private static instance: CardRegistry;
    private idCounter = 0;

    private constructor() { }

    public static getInstance(): CardRegistry {
        if (!CardRegistry.instance) {
            CardRegistry.instance = new CardRegistry();
        }
        return CardRegistry.instance;
    }

    public getStartingCards(): Card[] {
        const startingCards: Card[] = [];
        for (const def of Object.values(CardPool)) {
            if (def.isStartingCard) {

                startingCards.push(this.createCard(def));
            }
        }
        return startingCards;
    }

    public getRandomCardsWeighted(count: number): Card[] {
        const poolKeys = Object.keys(CardPool);
        if (poolKeys.length === 0) return [];

        let totalWeight = 0;
        const cumulativeWeights: number[] = [];
        const candidates = Object.values(CardPool);

        for (const candidate of candidates) {
            totalWeight += candidate.weight;
            cumulativeWeights.push(totalWeight);
        }

        const selectedCards: Card[] = [];
        for (let i = 0; i < count; i++) {
            const roll = Math.random() * totalWeight;
            let selectedDef = candidates[candidates.length - 1]; // fallback

            for (let j = 0; j < cumulativeWeights.length; j++) {
                if (roll <= cumulativeWeights[j]) {
                    selectedDef = candidates[j];
                    break;
                }
            }
            selectedCards.push(this.createCard(selectedDef));
        }
        return selectedCards;
    }

    private createCard(def: CardDefinition): Card {
        this.idCounter++;

        // Deep copy effects to avoid state mutation risk
        const clonedEffects = def.effects.map(effect => {
            // Simple clone works for these plain objects as they don't have nested refs
            // except pattern array in CUT
            if (effect.type === 'CUT') {
                return {
                    ...effect,
                    pattern: effect.pattern.map(p => ({ ...p }))
                };
            }
            return { ...effect };
        });

        return {
            id: `card-${this.idCounter}-${Date.now()}`,
            name: def.name,
            visualColor: def.visualColor,
            effects: clonedEffects,
            memory: def.memory
        };
    }
}

export const cardRegistry = CardRegistry.getInstance();
