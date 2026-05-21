import Phaser from "phaser";

export const GameEvents = new Phaser.Events.EventEmitter();

export const EVENTS = {
  STATE_CHANGED: "state-changed",

  SHOP_OPENED: "shop-opened",
  SHOP_CLOSED: "shop-closed",
  INVENTORY_OPENED: "inventory-opened",
  INVENTORY_CLOSED: "inventory-closed",

  BUY_ITEM: "buy-item",
  USE_ITEM: "use-item",

  SAVE_GAME: "save-game",
  LOAD_GAME: "load-game",
  RESET_SAVE: "reset-save",
};
