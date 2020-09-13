# Why I don't need a ECS

I have been debating with myself if I need to add an ECS(entity component system) to this game. For
one, it is cool because most client side game engine uses it. Secondly I hope it can help me
structure the server side game logic better and avoid some large files. After careful consideration,
I think I do not need one. I am writing this to remind myself why an ECS is not needed on the server
side.

The benifit of an ECS is that it allows developer to separate the functionalities into different
components and systems. An immaginary interface of an ECS would be like the following:

```javascript
const world = World.create(); // create a world, which is an container for all entities and systems.

// Register all the systems. In every frame, each system is called in the order they are registered.
world
    .registerSystem(SystemA.create())
    .registerSystem(SystemB.create())
    .registerSystem(SystemC.create());

// Create entities
const entityA = world.addEntity();
const entityB = world.addEntity();

// Add component to entities. The components are simple data holder, which will be queried and consume by systems.
entityA.addComponent(ComponentA).addComponent(ComponentB);
```

In a system, we can query the components and do batch processing.

```javascript
class SystemA extends System {
    update(timeElapse) {
        // query for all entities that has ComponentA and ComponentB but no ComponentC
        const interestedEntities = this.queryEntities()
            .with(ComponentA)
            .with(componentB)
            .no(componentC)
            .query();
        interestedEntities.forEach(this.process.bind(this));
    }
}
```

## Why I don't need systems

System brings inversion of control. A naive way of implementing a game would be having a god object
process all entities each frame:

```javascript
function update(elapsedTime) {
    for (const player of players) {
        updatePostion(player);
    }
    for (const enemy of enemies) {
        updatePostion(enemy);
        attack(enemy, players);
    }
}
```

In an ECS, the god object is hidden. Instead developer are encouraged to think in terms of
individual systems. For example, `PositionSystem` will only take care of updating the position of
entities, and `EnemyAttackSystem` will only take care of executing attack action for all enemy
entites. We should of the order of registration to specify `PositionSystem` runs before
`EnemyAttackSystem` each frame.

The problem I see with using systems is that, it is very hard to pass states between systems. As
systems are designed to be isolated. If we want to implement "enemies will only attack when all
players moved", we would need to have the state "all players moved" store somewhere (perhaps another
entity just to serve as a state container).

In a turn based game, there are lots of states. Each turn will follow a somewhat predefined
procedures, for example "tell current player to roll" -> "ask current player to move" -> "announce
current player's final location". Trying to isolate game logic to different systems will force me to
externalize many of the intermediate state which I won't care afterwards. In another word, the
complexity of a turn base game lies in the state transitioning logic which are better solved using a
finite state machine than ECS.

## Why I don't need components

In ECS, entities are generic, and components makes each entity unique. Component is a great way to
break down the inheritance chain. Instead of having a `Player` class extends `Moveable`, we can have
a player entity with a `PlayerComponent` and `MoveableComponent`. `PlayerComponent` could just be an
empty tag component (component that doesn't have any data, and only serves as a tag). Components
provide a flexible way to describe different aspects of entity and allow us to reuse code. For
example, if we want to create a wizard and a warrior that are both human, we can do:

```javascript
const wizard = world.addEntity().addComponent(HumanComponent).addComponent(WizardComponent);
const warrior = world.addEntity().addComponent(HumanComponent).addComponent(WarriorComponent);

function isWizard(entity) {
    return entity.hasComponent(HumanComponent) && entity.hasComponent(WizardComponent);
}

function isWarrior(entity) {
    return entity.hasComponent(HumanComponent) && entity.hasComponent(WarriorComponent);
}
```

An alternative of using components is to just have fields on classes.

```typescript
interface WizardComponent {
    // encapsulate all data inside a -'Data' object so that it doesn't interfere with other interfaces
    wizard: WizardData;
}
interface WarriorComponent {
    warrior: WarriorData;
}
// TypeScript
class Human implements WizardComponent, WarriorComponent {
    public wizard: WizardData = null;
    public warrior: WarriorData = null;

    public static createWizard(): Human {
        const wizard = new Human();
        wizard.wizard = WizardData.create();
        return wizard;
    }

    public static createWarrior(): Human {
        const warrior = new Human();
        warrior.warrior = WarriorData.create();
        return warrior;
    }

    public isWizard(): boolean {
        return this.wizard !== null;
    }

    public isWarrior(): boolean {
        return this.isWarrior !== null;
    }
}
```

Second approach have the same benefits of using composition instead of inheritance. It also allows
us to have some static check to make sure the components on the object actually make sense. There is
nothing against adding two `WarriorComponent`s to the same entity, or adding both `CatComponent` and
`HumanComponent` to the same entity.

The disadvantage of second approach is that we might end up with a giant class that has many fields.
In that case, we can think about if we can break the class into smaller, more representative
classes. For example, breaking

```typescript
class Human
    implements WizardComponent, WarriorComponent, MagicStatComponent, PhysicalStatComponent {}
```

into

```typescript
class Wizard implements WizardComponent, MagicStatComponent, PhysicalStatComponent {}
class Warrior implements WarriorComponent, PhysicalStatComponent {}
```

For turn based game server side, we don't need to worry too much about animation, physics, position
on the screen, stacking order, etc. Many of the most common components in client side game engine
are not needed. The remainings are components about the state, which in most case, are closely
related to the type of the class.

## Querying entities base on components

ECS usually allows us to query entities with components. For example, a `MovementSystem` can query
all entities with `PositionComponent` and `SpeedComponent`. This free us from storing a collection
of interested entities in the system. Game engine might do some caching to make the querying
performent.

IMHO, if we can get away from using query, we should. Because, no matter how performent the query
is, it is less performant than manually keeping a collection of entities. In the worst case, when we
don't have any cache for a query, we basically go through all the entities in the world and check if
they match the query.

Modern game engines provide some ways for developers to get access to other entities. Most game
engines have scene graphs. It allows developers to group related objects in a subtree of scene
nodes. This way, if we know which subtree to query for, we can just query within the subtree. Some
engines, like Unity, CocosCreator, allows developers to drag entity to the fields of a component,
basically saving the association among entities in data files, and realize those association in
runtime.

## Serialization and deserialization

Most modern game engines with a visual editor saves game scene in some text format that gets
deserialized during run time. ECS provide a perfect story for serialization and deserialization. As
long as each type of component provide a serialization and deserialization function, an entity can
be encoded as concatenation of component serializations.

Without using components, the (de)serialization becomes a bit more complex. Because each class need
to implement (de)serialization. Although this might not be a bad thing as we can do some sanity
check during (de)serialization. When I use game engines, one mistake I made the most is forgot to
attach the newly created component to an entity.

## What I can learn from ECS

Although I don't think I need a fullblown ECS, I can get some nuggets from it. For example, it is
useful to have a world that manages all the entities, instead of having some entities owning others.

```
world
 - players
    - player1
    - player2
 - houses
    - house1
    - house2
```

is better than

```
player1
 - owned
  - house1
player2
 - owned
   - house2
```

Having a flat structure makes easier to apply global operations to game objects, such as
serialization and deserialization. Each game object should use id to reference other objects instead
of references. This allows object to be garbage collected if we simply remove it from the world. It
also aids initialization from text file format.
