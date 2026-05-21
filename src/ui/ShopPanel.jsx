import { useEffect, useState } from "react";
import { GameEvents, EVENTS } from "../game/GameEvents";

const items = [
  {
    id: "healthPotion",
    name: "Health Potion",
    price: 20,
    description: "Adds one potion to inventory. Use from inventory to heal 35 HP.",
  },
  {
    id: "swordUpgrade",
    name: "Sword Upgrade",
    price: 50,
    description: "Permanently increases player damage by 7.",
  },
  {
    id: "castleRepair",
    name: "Castle Repair",
    price: 30,
    description: "Repairs 70 castle HP instantly.",
  },
];

export default function ShopPanel() {
  const [open, setOpen] = useState(false);
  const [state, setState] = useState({ gold: 0 });

  useEffect(() => {
    const openShop = () => setOpen(true);
    const closeShop = () => setOpen(false);
    const onState = (nextState) => setState((old) => ({ ...old, ...nextState }));

    GameEvents.on(EVENTS.SHOP_OPENED, openShop);
    GameEvents.on(EVENTS.SHOP_CLOSED, closeShop);
    GameEvents.on(EVENTS.STATE_CHANGED, onState);

    return () => {
      GameEvents.off(EVENTS.SHOP_OPENED, openShop);
      GameEvents.off(EVENTS.SHOP_CLOSED, closeShop);
      GameEvents.off(EVENTS.STATE_CHANGED, onState);
    };
  }, []);

  if (!open) return null;

  return (
    <section className="overlay-panel shop-panel">
      <div className="panel-title-row">
        <div>
          <h2>Village Shop</h2>
          <p>Gold: 🪙 {state.gold}</p>
        </div>
        <button onClick={() => GameEvents.emit(EVENTS.SHOP_CLOSED)}>Close</button>
      </div>

      <div className="shop-list">
        {items.map((item) => {
          const canBuy = state.gold >= item.price;

          return (
            <article className="shop-card" key={item.id}>
              <div>
                <h3>{item.name}</h3>
                <p>{item.description}</p>
                <strong>Price: 🪙 {item.price}</strong>
              </div>

              <button
                disabled={!canBuy}
                onClick={() => GameEvents.emit(EVENTS.BUY_ITEM, item.id)}
              >
                {canBuy ? "Buy" : "Need Gold"}
              </button>
            </article>
          );
        })}
      </div>

      <p className="panel-hint">Press B again or Close to leave shop.</p>
    </section>
  );
}
