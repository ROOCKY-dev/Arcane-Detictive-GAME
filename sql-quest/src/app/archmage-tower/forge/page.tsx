import { QuestForge } from './QuestForge';

export default function ForgePage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-cinzel text-arcane-gold text-xl font-bold mb-1">Forge a Quest</h2>
        <p className="text-parchment-light/40 text-sm font-inter">
          Craft a custom SQL mystery, compile its database, and publish it to your class.
        </p>
      </div>
      <QuestForge />
    </div>
  );
}
