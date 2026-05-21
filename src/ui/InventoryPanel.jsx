import { useEffect, useState } from "react";
import { GameEvents, EVENTS } from "../game/GameEvents";

const defaultInventory = {
  healthPotion: 0,
  monsterClaw: 0,
  wolfPelt: 0,
  goblinCoin: 0,
};

export default function InventoryPanel() {
  const [open, setOpen] = useState(false);
  const [state, setState] = useState({
    inventory: defaultInventory,
    damage: 18,
    level: 1,
  });

  useEffect(() => {
    const openInventory = () => setOpen(true);
    const closeInventory = () => setOpen(false);
    const onState = (nextState) => setState((old) => ({ ...old, ...nextState }));

    GameEvents.on(EVENTS.INVENTORY_OPENED, openInventory);
    GameEvents.on(EVENTS.INVENTORY_CLOSED, closeInventory);
    GameEvents.on(EVENTS.STATE_CHANGED, onState);

    return () => {
      GameEvents.off(EVENTS.INVENTORY_OPENED, openInventory);
      GameEvents.off(EVENTS.INVENTORY_CLOSED, closeInventory);
      GameEvents.off(EVENTS.STATE_CHANGED, onState);
    };
  }, []);

  if (!open) return null;

  const inv = { ...defaultInventory, ...(state.inventory || {}) };

  return (
    <section className="overlay-panel inventory-panel">
      <div className="panel-title-row">
        <div>
          <h2>Inventory</h2>
          <p>Hero Level {state.level} • Damage {state.damage}</p>
        </div>
        <button onClick={() => GameEvents.emit(EVENTS.INVENTORY_CLOSED)}>Close</button>
      </div>

      <div className="inventory-list">
        <article className="inventory-card">
          <div>
            <h3>Health Potion</h3>
            <p>Count: {inv.healthPotion}</p>
            <small>Restores 35 HP.</small>
          </div>

          <button
            disabled={inv.healthPotion <= 0}
            onClick={() => GameEvents.emit(EVENTS.USE_ITEM, "healthPotion")}
          >
            Use
          </button>
        </article>

        <article className="inventory-card">
          <div>
            <h3>Monster Claw</h3>
            <p>Count: {inv.monsterClaw}</p>
            <small>Loot from stronger enemies.</small>
          </div>
        </article>

        <article className="inventory-card">
          <div>
            <h3>Wolf Pelt</h3>
            <p>Count: {inv.wolfPelt}</p>
            <small>Loot from wolves.</small>
          </div>
        </article>

        <article className="inventory-card">
          <div>
            <h3>Goblin Coin</h3>
            <p>Count: {inv.goblinCoin}</p>
            <small>Small coin dropped by goblins.</small>
          </div>
        </article>
      </div>

      <p className="panel-hint">Press I again or Close to leave inventory.</p>
    </section>
  );
}
