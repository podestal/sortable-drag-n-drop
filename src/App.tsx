import React, { DragEventHandler, useState } from "react"
import { motion } from "framer-motion"
import { FiPlus, FiTrash } from "react-icons/fi"
import { FaFire } from "react-icons/fa"

const DEFAULT_CARDS = [
  // BACKLOG
  { title: "Look into render bug in dashboard", id: "1", column: "backlog" },
  { title: "SOX compliance checklist", id: "2", column: "backlog" },
  { title: "[SPIKE] Migrate to Azure", id: "3", column: "backlog" },
  { title: "Document Notifications service", id: "4", column: "backlog" },
  // TODO
  {
    title: "Research DB options for new microservice",
    id: "5",
    column: "todo",
  },
  { title: "Postmortem for outage", id: "6", column: "todo" },
  { title: "Sync with product on Q3 roadmap", id: "7", column: "todo" },

  // DOING
  {
    title: "Refactor context providers to use Zustand",
    id: "8",
    column: "doing",
  },
  { title: "Add logging to daily CRON", id: "9", column: "doing" },
  // DONE
  {
    title: "Set up DD dashboards for Lambda listener",
    id: "10",
    column: "done",
  },
]

interface Card {
  id: string
  title: string
  column: string
}

const App = () => {

  return (
    <div className="h-screen w-full bg-neutral-900 text-neutral-50">
      <Board />
    </div>
  )
}

const Board = () => {

  const [cards, setCards] = useState(DEFAULT_CARDS)

  return (
    <div className="flex h-full w-full gap-3 overflow-scroll p-12">
      <Column
        title="Backlog"
        column="backlog"
        headingColor="text-neutral-500"
        cards={cards}
        setCards={setCards}
      />
      <Column
        title="TODO"
        column="todo"
        headingColor="text-yellow-200"
        cards={cards}
        setCards={setCards}
      />
      <Column
        title="In progress"
        column="doing"
        headingColor="text-blue-200"
        cards={cards}
        setCards={setCards}
      />
      <Column
        title="Complete"
        column="done"
        headingColor="text-emerald-200"
        cards={cards}
        setCards={setCards}
      />
      <BurnBarrel setCards={setCards}/>
    </div>
  )
}

interface ColumnPros {
  title: string
  headingColor: string
  column: string
  setCards: (setter: []) => void
  cards: Card[]
}

const Column = ({ title, headingColor, column, cards, setCards }: ColumnPros) => {

  const [active, setActive] = useState(false)
  const filteredCards = cards.filter( card => card.column === column)

  const handleDragStart = (e:any, card:Card) => {
    e.dataTransfer.setData("cardId", card.id)
  }

  return (
    <div className="w-56 shrink-0">
      <div className="mb-3 flex items-center justify-between">
        <h3 className={`font-medium ${headingColor}`}>{title}</h3>
        <span className="rounded text-sm text-neutral-400">
          {filteredCards.length}
        </span>
      </div>
      <div
        className={`h-full w-full transition-colors ${
          active ? "bg-neutral-800/50" : "bg-neutral-800/0"
        }`}
      >
        {filteredCards.map( fileteredCard => (
          <Card 
            key={fileteredCard.id}
            id={fileteredCard.id}
            title={fileteredCard.title}
            column={fileteredCard.column}
            handleDragStart={handleDragStart}
          />
        ))}
        <DropIndicator beforeId='-1' column={column} />
        <AddCard column={column} setCards={setCards}/>
      </div>
    </div>
  )
}

interface CardProps {
  title: string
  id: string
  column: string
  handleDragStart: any
}

const Card = ({ title, id, column, handleDragStart }: CardProps) => {
  return (
    <>
      <DropIndicator beforeId={id} column={column} />
      <motion.div
        layout
        layoutId={id}
        draggable="true"
        onDragStart={(e) => handleDragStart(e, { title, id, column })}
        className="cursor-grab rounded border border-neutral-700 bg-neutral-800 p-3 active:cursor-grabbing"
      >
        <p className="text-sm text-neutral-100">{title}</p>
      </motion.div>
    </>
  );
};

interface DropIndicatorProps {
  beforeId: string
  column: string
}

const DropIndicator = ({ beforeId, column }: DropIndicatorProps) => {
  return (
    <div
      data-before={beforeId || "-1"}
      data-column={column}
      className="my-0.5 h-0.5 w-full bg-violet-400 opacity-0"
    />
  );
};

const BurnBarrel = ({ setCards }: {setCards: any}) => {
  const [active, setActive] = useState(false);

  const handleDragOver = (e:any) => {
    e.preventDefault()
    setActive(true)
  }

  const handleDragLeave = () => {
    setActive(false)
  }

  const handleDragEnd = (e:any) => {
    const cardId = e.dataTransfer.getData('cardId')
    setCards((prev: Card[]) => prev.filter( card => card.id !== cardId))
    setActive(false)
    
  }

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDragEnd}
      className={`mt-10 grid h-56 w-56 shrink-0 place-content-center rounded border text-3xl ${
        active
          ? "border-red-800 bg-red-800/20 text-red-500"
          : "border-neutral-500 bg-neutral-500/20 text-neutral-500"
      }`}
    >
      {active ? <FaFire className="animate-bounce" /> : <FiTrash />}
    </div>
  );
};

export default App

interface AddCardProps {
  column: string
  setCards: any
} 

const AddCard = ({ column, setCards }: AddCardProps) => {
  const [text, setText] = useState("");
  const [adding, setAdding] = useState(false);

  const handleSubmit = (e:React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const newCard = {
      title: text.trim(),
      column,
      id: Math.random().toString()
    }

    setCards((prev: Card[]) => [...prev, newCard])

    setAdding(false)
    setText("")
  }

  return (
    <>
      {adding 
      ? 
      <motion.form layout onSubmit={handleSubmit}>
        <textarea
          onChange={(e) => setText(e.target.value)}
          autoFocus
          placeholder="Add new task..."
          className="w-full rounded border border-blue-400 bg-blue-400/20 p-3 text-sm text-neutral-50 placeholder-blue-300 focus:outline-0"
        />
        <div className="mt-1.5 flex items-center justify-end gap-1.5">
          <button
            onClick={() => setAdding(false)}
            className="px-3 py-1.5 text-xs text-neutral-400 transition-colors hover:text-neutral-50"
          >
            Close
          </button>
          <button
            type="submit"
            className="flex items-center gap-1.5 rounded bg-neutral-50 px-3 py-1.5 text-xs text-neutral-950 transition-colors hover:bg-neutral-300"
          >
            <span>Add</span>
            <FiPlus />
          </button>
        </div>
      </motion.form>
      :
      <button
        onClick={() => setAdding(true)}
        className="flex w-full items-center gap-1.5 px-3 py-1.5 text-xs text-neutral-400 transition-colors hover:text-neutral-50"
      >
        <span>Add card</span>
        <FiPlus />
      </button>}
    </>
  )
}