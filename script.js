"use strict";

!function (universe) {
  const GLOBAL_DEFAULTS = {
    background: null,
    padding: 0,
    fontSize: 50,
    lineHeight: 100,
    lineWidth: 2,
    fontFamily: 'sans-serif',
    weight: 'normal',
    baseline: 'middle',
    pointerRadius: 10,
    textAlign: 'center',
    verticalAlignment: 'top',
    strokeStyle: 'red',
    fillStyle: 'black',
    compositeOperation: 'source-over',
    horizontalAlignment: 'left'
  };

  class Util {
    static getWidest(strings, {
      fontSize,
      fontFamily
    } = {}) {
      let $canvas = document.createElement('canvas').getContext('2d');
      $canvas.font = `${fontSize}px ${fontFamily}`;
      let widest = $canvas.measureText(strings[0]).width;

      for (let i = 1; i < strings.length; i++) {
        if ($canvas.measureText(strings[i]).width > widest) widest = $canvas.measureText(strings[i]).width;
      }

      $canvas = null;
      return widest;
    }

    static getStringWidth(string, {
      fontSize,
      fontFamily
    } = {}) {
      let $canvas = document.createElement('canvas').getContext('2d');
      $canvas.font = `${fontSize}px ${fontFamily}`;
      let width = $canvas.measureText(string).width;
      $canvas = null;
      return width;
    }

    static pickRandom(choice) {
      return choice[~~(Math.random() * choice.length)];
    }

    static randomInRange(min, max) {
      return Math.random() * (max - min) + min;
    }

  }

  class Component {
    constructor() {
      this.props = {}; //will hold flags and values to be shared with this component's children  (e.g. mouse coordinates)
    }

    setProps(prop, value) {
      this.props[prop] = value;
    }

    getProp(prop) {
      return this.props[prop];
    }

    onUpdate(method) {
      this.update = method.bind(this);
    }

    onRender(method) {
      this.render = method.bind(this);
    }

    onMount(method) {
      this.mount = method.bind(this);
    }

  }

  class BoundedComponent extends Component {
    constructor(width, height, {
      position = {
        x: 0,
        y: 0
      },
      padding = GLOBAL_DEFAULTS.padding,
      verticalAlignment = GLOBAL_DEFAULTS.verticalAlignment,
      horizontalAlignment = GLOBAL_DEFAULTS.horizontalAlignment
    } = {}) {
      super();
      this.width = width;
      this.height = height;
      this.position = position;
      this.renderingPosition = {
        x: null,
        y: null
      }; //will be calculated when the component is mounted in the scene

      this.padding = padding;
      this.verticalAlignment = verticalAlignment;
      this.horizontalAlignment = horizontalAlignment;
    }

    createSpaceProps(bounds) {
      const innerBounds = {
        x: null,
        y: null,
        w: null,
        h: null
      };
      const renderingPosition = {
        x: null,
        y: null
      };

      switch (this.verticalAlignment) {
        case 'top':
          innerBounds.y = bounds.y + this.padding;
          renderingPosition.y = bounds.y;
          break;

        case 'middle':
          innerBounds.y = bounds.y + bounds.h / 2 - this.height / 2 + this.padding;
          renderingPosition.y = bounds.y + bounds.h / 2 - this.height / 2;
          break;

        case 'bottom':
          innerBounds.y = bounds.y + bounds.h - this.height + this.padding;
          renderingPosition.y = bounds.y + bounds.h - this.height;
      }

      switch (this.horizontalAlignment) {
        case 'left':
          innerBounds.x = bounds.x + this.padding;
          renderingPosition.x = bounds.x;
          break;

        case 'center':
          innerBounds.x = bounds.x + bounds.w / 2 - this.width / 2 + this.padding;
          renderingPosition.x = bounds.x + bounds.w / 2 - this.width / 2;
          break;

        case 'right':
          innerBounds.x = bounds.x + bounds.w - this.width + this.padding;
          renderingPosition.x = bounds.x + bounds.w - this.width;
      }

      innerBounds.w = this.width - this.padding * 2;
      innerBounds.h = this.height - this.padding * 2;
      innerBounds.x += this.position.x;
      innerBounds.y += this.position.y;
      renderingPosition.x += this.position.x;
      renderingPosition.y += this.position.y;
      return {
        innerBounds,
        renderingPosition
      };
    }

    drawMyOutline() {
      //for debugging
      const $ = this.getProp('sceneContext');
      $.save();
      $.strokeStyle = 'red';
      $.setLineDash([5, 10]);
      $.lineWidth = 3;
      $.strokeRect(this.innerBounds.x, this.innerBounds.y, this.innerBounds.w, this.innerBounds.h);
      $.restore();
    }

    setBounds(outerBounds = this.getParentProp('innerBounds')) {
      const spaceProps = this.createSpaceProps(outerBounds);
      this.innerBounds = spaceProps.innerBounds;
      this.renderingPosition = spaceProps.renderingPosition;
      this.setProps('innerBounds', this.innerBounds);
    }

  }

  class TextNode extends BoundedComponent {
    constructor(string, lineHeight, {
      position = {
        x: 0,
        y: 0
      },
      lineWidth = 0,
      fillStyle = GLOBAL_DEFAULTS.fillStyle,
      strokeStyle = GLOBAL_DEFAULTS.strokeStyle,
      padding = GLOBAL_DEFAULTS.padding,
      fontSize = GLOBAL_DEFAULTS.fontSize,
      fontFamily = GLOBAL_DEFAULTS.fontFamily,
      weight = GLOBAL_DEFAULTS.weight,
      verticalAlignment = GLOBAL_DEFAULTS.verticalAlignment,
      horizontalAlignment = GLOBAL_DEFAULTS.horizontalAlignment
    } = {}) {
      const width = Util.getStringWidth(string, {
        fontSize,
        fontFamily
      });
      super(width, lineHeight, {
        position,
        padding,
        verticalAlignment,
        horizontalAlignment
      });
      this.string = string;
      this.contextProps = {
        fontSize,
        fontFamily,
        weight,
        fillStyle,
        lineWidth,
        strokeStyle
      };
    }

    createSpaceProps(bounds) {
      const innerBounds = {
        x: null,
        y: null,
        w: null,
        h: null
      };
      const renderingPosition = {
        x: null,
        y: null
      };

      switch (this.verticalAlignment) {
        case 'top':
          innerBounds.y = bounds.y + this.padding;
          renderingPosition.y = bounds.y + this.height / 2;
          break;

        case 'middle':
          innerBounds.y = bounds.y + bounds.h / 2 - this.height / 2 + this.padding;
          renderingPosition.y = bounds.y + bounds.h / 2;
          break;

        case 'bottom':
          innerBounds.y = bounds.y + bounds.h - this.height + this.padding;
          renderingPosition.y = bounds.y + bounds.h - this.height / 2;
      }

      switch (this.horizontalAlignment) {
        case 'left':
          innerBounds.x = bounds.x + this.padding;
          renderingPosition.x = bounds.x + this.width / 2;
          break;

        case 'center':
          innerBounds.x = bounds.x + bounds.w / 2 - this.width / 2 + this.padding;
          renderingPosition.x = bounds.x + bounds.w / 2;
          break;

        case 'right':
          innerBounds.x = bounds.x + bounds.w - this.width + this.padding;
          renderingPosition.x = bounds.x + bounds.w - this.width / 2;
      }

      innerBounds.w = this.width - this.padding * 2;
      innerBounds.h = this.height - this.padding * 2;
      innerBounds.x += this.position.x;
      innerBounds.y += this.position.y;
      renderingPosition.x += this.position.x;
      renderingPosition.y += this.position.y;
      return {
        innerBounds,
        renderingPosition
      };
    }

    update() {} //kinda like an abstract method


    render() {} //same ^^^


  }

  class Container extends BoundedComponent {
    constructor(width, height, {
      position = {
        x: 0,
        y: 0
      },
      padding = GLOBAL_DEFAULTS.padding,
      verticalAlignment = GLOBAL_DEFAULTS.verticalAlignment,
      horizontalAlignment = GLOBAL_DEFAULTS.horizontalAlignment
    } = {}) {
      super(width, height, {
        position,
        padding,
        verticalAlignment,
        horizontalAlignment
      });
      this.components = [];
    }

    update() {} //again similar thing to an abstract method


    updateComponents() {
      for (let i = 0; i < this.components.length; i++) {
        const component = this.components[i];

        if (!component.getProp('pointer')) {
          component.setProps('pointer', this.getProp('pointer'));
        }

        component.update();

        if (component instanceof BoundedComponent) {
          component.setBounds();
        }

        if (component.components && component.components.length) {
          component.updateComponents();
        }
      }
    }

    applyContextProps({
      lineWidth = GLOBAL_DEFAULTS.lineWidth,
      compositeOperation = GLOBAL_DEFAULTS.compositeOperation,
      strokeStyle = GLOBAL_DEFAULTS.strokeStyle,
      fillStyle = GLOBAL_DEFAULTS.fillStyle,
      fontSize = GLOBAL_DEFAULTS.fontSize,
      fontFamily = GLOBAL_DEFAULTS.fontFamily,
      weight = GLOBAL_DEFAULTS.weight
    } = {}) {
      const $ = this.getProp('sceneContext');
      $.save();
      $.strokeStyle = strokeStyle;
      $.fillStyle = fillStyle;
      $.lineWidth = lineWidth;
      $.globalCompositeOperation = compositeOperation;
      $.font = `${weight} ${fontSize}px ${fontFamily}`;
    }

    render() {} //yep, again...


    restoreSceneContext() {
      const $ = this.getProp('sceneContext');
      $.restore();
    }

    renderComponents() {
      for (let i = 0; i < this.components.length; i++) {
        const component = this.components[i];

        if (component.contextProps) {
          this.applyContextProps(component.contextProps);
        }

        component.render();

        if (component.contextProps) {
          this.restoreSceneContext();
        }

        if (component.components && component.components.length) {
          component.renderComponents();
        }
      }
    }

    addComponent(component) {
      component.setParentProp = this.setProps.bind(this);
      component.getParentProp = this.getProp.bind(this);

      if (!component.getProp('pointer')) {
        component.setProps('pointer', this.getProp('pointer'));
      }

      if (!component.getProp('sceneContext')) {
        component.setProps('sceneContext', this.getProp('sceneContext'));
      }

      if (component instanceof BoundedComponent) {
        component.setBounds();
      }

      if (component.mount) component.mount();
      this.components.push(component);
    }

    addMulti(components) {
      for (let i = 0; i < components.length; i++) {
        this.addComponent(components[i]);
      }
    }

  }

  class Scene extends Container {
    constructor(canvas, {
      pointer = null,
      padding = GLOBAL_DEFAULTS.padding,
      background = GLOBAL_DEFAULTS.background
    } = {}) {
      super(canvas.width, canvas.height, {
        padding
      }); //set up the rendering canvas and it's context

      this.canvas = canvas;
      this.context = this.setBaseContext(canvas); //this will be passed down to other sub-components of the view

      if (pointer instanceof Pointer) this.pointer = this.initilisePointer(pointer);
      this.background = background;
      this.frameID = null; //will hold the scene's animation frame
    }

    drawCross() {
      //useful in some cases while debugging
      this.context.moveTo(0, this.context.canvas.height / 2);
      this.context.lineTo(this.context.canvas.width, this.context.canvas.height / 2);
      this.context.moveTo(this.context.canvas.width / 2, 0);
      this.context.lineTo(this.context.canvas.width / 2, this.context.canvas.height);
      this.context.stroke();
    }

    drawBox(x, y, width, height) {
      this.context.strokeRect(x, y, width, height);
    } //useful in some cases while debugging


    resizeScene(w, h) {
      this.context.canvas.width = this.canvas.width = this.width = w;
      this.context.canvas.height = this.canvas.height = this.height = h;
      this.resetContext();
    }

    resetContext() {
      this.context.textBaseline = GLOBAL_DEFAULTS.baseline;
      this.context.textAlign = GLOBAL_DEFAULTS.textAlign;
    }

    setBaseContext(canvas) {
      const $ = canvas.getContext('2d');
      $.textBaseline = GLOBAL_DEFAULTS.baseline;
      $.textAlign = GLOBAL_DEFAULTS.textAlign;
      this.setProps('sceneContext', $);
      return $;
    }

    addPointer(pointer) {
      this.pointer = this.initilisePointer(pointer);
    }

    initilisePointer(pointer) {
      pointer.setParentProp = this.setProps.bind(this);
      pointer.getParentProp = this.getProp.bind(this);
      pointer.setProps('sceneContext', this.getProp('sceneContext'));
      this.setProps('pointer', pointer);
      return pointer;
    }

    updatePointerPosition(x, y) {
      if (this.pointer) {
        this.pointer.setTargetPosition(x, y);
      } else {
        throw new Warning("The scene's pointer hasn't been initialised");
      }
    }

    resize(width, height) {
      this.resizeScene(width, height);
      this.setBounds({
        x: 0,
        y: 0,
        w: width,
        h: height
      });
      this.update();
    }

    updatePointer() {
      this.pointer.update();
    }

    update() {
      if (this.pointer) this.updatePointer();
      this.updateComponents();
    }

    clearScene() {
      if (this.background) {
        this.context.save();
        this.context.fillStyle = this.background;
        this.context.fillRect(0, 0, this.context.canvas.width, this.context.canvas.height);
        this.context.restore();
      } else {
        this.context.clearRect(0, 0, this.context.canvas.width, this.context.canvas.height);
      }
    }

    renderPointer() {
      if (this.pointer.contextProps) this.applyContextProps(this.pointer.contextProps);
      this.pointer.render();
    }

    render() {
      this.clearScene();
      this.renderComponents();
      if (this.pointer) this.renderPointer();
    }

    animate() {
      this.update();
      this.render();
      this.frameID = window.requestAnimationFrame(this.animate.bind(this));
    }

  }

  class Pointer extends Component {
    //basic pointer class (I would recommend extending it for more fancy pointers)
    constructor({
      visible = true,
      strokeStyle = GLOBAL_DEFAULTS.strokeStyle,
      compositeOperation = GLOBAL_DEFAULTS.compositeOperation,
      fillStyle = GLOBAL_DEFAULTS.fillStyle,
      radius = GLOBAL_DEFAULTS.pointerRadius,
      lineWidth = GLOBAL_DEFAULTS.lineWidth
    } = {}) {
      super();
      this.renderingPosition = {
        x: null,
        y: null
      };
      this.targetPosition = {
        x: null,
        y: null
      };
      this.radius = radius;
      this.visible = visible;
      this.contextProps = {
        fillStyle,
        strokeStyle,
        lineWidth,
        compositeOperation
      };
    }

    setTargetPosition(x, y) {
      //this is the actual real-time location of the cursor pick fresh and ripe from the DOM
      this.targetPosition.x = x;
      this.targetPosition.y = y;
    }

    initialisePosition(x, y) {
      //this is the actual real-time location of the cursor pick fresh and ripe from the DOM
      this.targetPosition.x = this.renderingPosition.x = x;
      this.targetPosition.y = this.renderingPosition.y = y;
    }

    hide() {
      this.visible = false;
    }

    show() {
      this.visible = true;
    }

    updateScenePointer() {
      this.setParentProp('mousePosition', this.targetPosition);
    }

    renderPointer() {
      const $ = this.getProp('sceneContext');
      $.beginPath();
      $.arc(this.renderingPosition.x, this.renderingPosition.y, this.radius, 0, Math.PI * 2);
      $.fill();
      $.stroke();
    }

    update() {
      this.renderingPosition = this.targetPosition;
      this.updateScenePointer();
    }

    render() {
      if (this.visible) this.renderPointer();
    }

  } ///////////////////////////////////
  //demo specific code starts here //
  ////////////////////////////////////
  ///////////////
  // CONSTANTS // (SORRY BUT I CANNOT HELP BUT SHOUT WHENEVER I AM DECLARING CONSTAAAANTS)
  //////////////


  const SMALL = 650;
  const PALETTE = ['#C20F00', '#000000', '#ffffff'];
  const LINE_HEIGHT = window.innerWidth >= SMALL ? 130 : 90;
  const FONT_SIZE = window.innerWidth >= SMALL ? 140 : 80;
  const FONT_FAMILY = 'Amatic SC';
  const LERP_FACTOR = 0.1;
  const MAX_PARTICLE_RADIUS = window.innerWidth >= SMALL ? 11 : 5;
  const ITEMS = ["Fell", "in Love", "with", "a Girl"];
  const WIDEST = Util.getWidest(ITEMS, {
    fontSize: FONT_SIZE,
    fontFamily: FONT_FAMILY
  });
  const MAX_PARTICLES = 150; //these guys will spring off of the pointer's current location

  class Particle {
    constructor(position, velocity = {
      x: Util.randomInRange(-1, 1),
      y: Util.randomInRange(-1, 1)
    }, radius = Math.random() * MAX_PARTICLE_RADIUS, color = Util.pickRandom(PALETTE)) {
      this.radius = radius;
      this.color = color;
      this.velocity = velocity;
      this.position = position;
      this.shrink = 0.05;
    }

    update() {
      this.radius -= this.shrink;
      this.position.x += this.velocity.x;
      this.position.y += this.velocity.y;
    }

    render($) {
      $.save();
      $.fillStyle = this.color;
      $.beginPath();
      $.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
      $.fill();
      $.restore();
    }

  } //extending the base pointer class


  class PoppinPointer extends Pointer {
    constructor(particlesN, options = {}) {
      super(options);
      this.renderingPosition = {
        x: null,
        y: null
      };
      this.maxParticles = particlesN;
      this.particles = [];
    }

    update() {
      this.renderingPosition.x += (this.targetPosition.x - this.renderingPosition.x) * LERP_FACTOR;
      this.renderingPosition.y += (this.targetPosition.y - this.renderingPosition.y) * LERP_FACTOR;
      this.updateScenePointer();

      if (this.particles.length < this.maxParticles) {
        this.particles.push(new Particle({
          x: this.renderingPosition.x,
          y: this.renderingPosition.y
        }));
      }

      for (let i = 0; i < this.particles.length; i++) {
        this.particles[i].update();

        if (this.particles[i].radius < 1) {
          this.particles.splice(i--, 1);
        }
      }
    }

    render() {
      const $ = this.getProp('sceneContext');

      for (let i = 0; i < this.particles.length; i++) {
        this.particles[i].render($);
      }
    }

  } //a component that will highlight the currently selected text node


  class Highlight extends BoundedComponent {
    constructor(width, height, {
      fillStyle = 'red',
      compositeOperation = 'source-atop'
    } = {}) {
      super(width, height);
      this.anchor = {
        x: 0,
        y: 0
      };
      this.targetPositionY = 0;
      this.contextProps = {
        fillStyle,
        compositeOperation
      };
    }

    updateTargetY(targetY) {
      this.targetPositionY = targetY;
    }

    update() {
      if (this.getParentProp('highlightPositionY') !== this.targetPositionY) {
        const newY = this.getParentProp('highlightPositionY');
        this.updateTargetY(newY);
      }

      this.position.y += (this.targetPositionY - this.position.y) * 0.07;
    }

    render() {
      const $ = this.getProp('sceneContext');
      $.fillRect(this.renderingPosition.x, this.renderingPosition.y, this.width, this.height);
    }

  }

  const $ = document.querySelector.bind(document);
  const $$ = document.querySelectorAll.bind(document); //scene's canvas

  const canvas = $('canvas');
  const context = canvas.getContext('2d');
  context.canvas.width = canvas.width = window.innerWidth;
  context.canvas.height = canvas.height = window.innerHeight; ////////////////
  // TEXT NODES //
  ////////////////

  const itemComponents = function (strings) {
    const textNodes = [];

    for (let i = 0; i < ITEMS.length; i++) {
      const textNode = new TextNode(strings[i], LINE_HEIGHT, {
        lineWidth: 3,
        strokeStyle: 'black',
        fillStyle: 'white',
        verticalAlignment: 'top',
        horizontalAlignment: 'center',
        position: {
          x: 0,
          y: LINE_HEIGHT * i
        },
        fontSize: FONT_SIZE,
        fontFamily: FONT_FAMILY
      });
      textNode.onUpdate(function () {
        const p = this.getProp('pointer');

        if (p && p.targetPosition.x >= this.innerBounds.x && p.targetPosition.x <= this.innerBounds.x + this.innerBounds.w && p.targetPosition.y >= this.innerBounds.y && p.targetPosition.y <= this.innerBounds.y + this.innerBounds.h) {
          this.setParentProp('highlightPositionY', this.position.y);
        }
      });
      textNode.onRender(function () {
        const $ = this.getProp('sceneContext');
        $.fillText(this.string, this.renderingPosition.x, this.renderingPosition.y);
        $.strokeText(this.string, this.renderingPosition.x, this.renderingPosition.y);
      });
      textNodes.push(textNode);
    }

    return textNodes;
  }(ITEMS); ///////////
  // SCENE //
  ///////////


  const scene = new Scene(canvas);
  scene.setBounds({
    x: 0,
    y: 0,
    w: canvas.width,
    h: canvas.height
  }); /////////////
  // POINTER //
  /////////////

  const poppinPointer = new PoppinPointer(MAX_PARTICLES);
  poppinPointer.onMount(function () {
    this.setParentProp('pointer', this);
  }); //////////////////////////////////
  // CONTAINER FOR THE TEXT NODES //
  //////////////////////////////////

  const lines = new Container(WIDEST, LINE_HEIGHT * ITEMS.length, {
    horizontalAlignment: 'center',
    verticalAlignment: 'middle'
  }); ///////////////
  // HIGHLIGHT //
  ///////////////

  const highlight = new Highlight(WIDEST, LINE_HEIGHT, {
    fillStyle: '#000000',
    compositeOperation: 'source-atop'
  });
  highlight.onMount(function () {
    this.setParentProp('highlightPositionY', 0);
  }); //Mount components onto scene

  scene.addComponent(lines);
  lines.addMulti(itemComponents);
  lines.addComponent(highlight);
  scene.animate(); //events

  canvas.addEventListener('mousemove', function (e) {
    if (!scene.pointer) {
      poppinPointer.initialisePosition(e.clientX, e.clientY);
      scene.addPointer(poppinPointer);
    } else {
      scene.updatePointerPosition(e.clientX, e.clientY);
    }
  });
  canvas.addEventListener('touchmove', function (e) {
    if (!scene.pointer) {
      poppinPointer.initialisePosition(e.touches[0].clientX, e.touches[0].clientY);
      scene.addPointer(poppinPointer);
    } else {
      scene.updatePointerPosition(e.touches[0].clientX, e.touches[0].clientY);
    }
  });
  window.addEventListener('resize', function () {
    scene.resize(window.innerWidth, window.innerHeight);
  });
}(void 0);
