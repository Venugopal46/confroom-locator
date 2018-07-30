const NS = "http://www.w3.org/2000/svg";
const CX = 0;
const CY = 0;
const NODE = document.getElementById('svg-floor');
const app = {
  // fetchFloorDetails() {
  //   return fetch('src/res/floors.json').then(res => res.json());
  // },
  menuEventHandlers() {
    const nav = document.getElementById('navigation');
    const ham = document.getElementById('hamburger');

    ham.addEventListener('click', e => {
      let el = e.target;
      while (el && el.id !== 'hamburger') {
        el = el.parentNode
      }
      if(el.classList.contains('is-active')) {
        el.classList.remove('is-active');
        nav.classList.remove('open');
      } else {
        el.classList.add('is-active');
        nav.classList.add('open');
      }
    }, false);
    const addActiveClass = (el) => {
      const currentActiveNav = document.querySelector('#navigation .active');
      currentActiveNav.classList.remove('active');
      el.classList.add('active');
    };
    nav.addEventListener('click', e => {
      const svg = document.getElementById('svgmap');
      const header = document.getElementById('page-header');
      let el = e.target;
      if(el && el.tagName === 'A') {
        addActiveClass(el);
        ham.classList.remove('is-active');
        nav.classList.remove('open');
        const { floor, name, box } = el.dataset;
        header.innerText = name;
        svg.setAttribute("viewBox", `0 0 ${box}`);
        if(localStorage.getItem('ml-lastseen') !== floor) {
          localStorage.setItem('ml-lastseen', floor);
          app.loadFloor(floor);
        }
      }
    });
  },
  removeAllChildren(el) {
    while (el.firstChild) {
      el.removeChild(el.firstChild);
    }
  },
  loadFloor(floor) {
    const svgfloor = document.getElementById('svg-floor');
    const ul = document.getElementById('list-of-rooms');
    const floorData = app.masterData[floor];
    app.removeAllChildren(svgfloor);
    app.removeAllChildren(ul);
    if(!floorData) {
      return;
    }
    const { seats, pillars, collabs, rooms, printers, people } = floorData;
    rooms && app.drawRooms(rooms);
    // draw 'seats' AFTER 'rooms' thus, seats which are inside a room will be drawn up in the stack(of svg paths).
    seats && app.drawSeats(seats);
    // label 'rooms' AFTER drawing them
    app.labelRooms();
    pillars && app.drawPillars(pillars);
    app.drawCollaborationSeats();
    rooms && rooms.list && app.populateRoomsList(rooms.list);
    app.populateSearchDatalist(people);
    app.attachEventHandlers();
  },
  populateSearchDatalist(people) {
    const dataList = document.getElementById('datalist');
    if(people) {
      for(const o in people) {
        // Create a new <option> element.
        const option = document.createElement('option');
        // Set the value using the item in the JSON array.
        option.value = o;
        option.innerText = people[o];
        // Add the <option> element to the <datalist>.
        dataList.appendChild(option);
      }
    } else {
      app.removeAllChildren(dataList);
    }
  },
  resizeEvents() {
    // set list items height to avoid vertical scroll
    const _body = document.getElementsByTagName('body');
    const _html = document.getElementsByTagName('html');
    const setHeight = (cl, h) => {
      const c = [...document.getElementsByClassName(cl)];
      c.forEach(e => {
        e.style.height = h;
      });
    };
    const resize = () => {
      setHeight('list-of-rooms', _html[0].offsetWidth >= 1024 ? _html[0].offsetHeight - 200 : 'auto');
      setHeight('content', _html[0].offsetWidth >= 1024 ? _html[0].offsetHeight - 150 : 'auto');
    };
    resize();
    window.onresize = resize;
  },
  attachEventHandlers() {
    app.resizeEvents();
    const wordRooms = document.querySelectorAll(".list-of-rooms li");
    const svgRooms = document.querySelectorAll(".meet-room");
    const svgSeats = document.querySelectorAll(".seat");
    const removeAllOn = () => {
      wordRooms.forEach(el => {
        el.classList.remove("on");
      });
      svgRooms.forEach(el => {
        el.classList.remove("on");
      });
      svgSeats.forEach(el => {
        el.classList.remove("on");
      });
      document.getElementById('emp-details').classList.remove('on');
      document.getElementById('not-found').classList.remove('on');
    };
    const addOnFromList = el => {
      let roomname = el.getAttribute("data-name");
      let svgroom = document.querySelectorAll("." + roomname);
      el.classList.add("on");
      svgroom.forEach(r => {
        r.classList.add("on");
      });
    };
    const addOnFromRoom = el => {
      const cl = el.classList.value.replace(/meet-room/, '').split(' ');
      cl.forEach(c => {
        if(c) {
          const list = document.querySelector(".list-of-rooms [data-name='" + c + "']");
          list && list.classList.add('on');
        }
      });
      el.classList.add('on');
    };
    const showEmpDetails = seat => {
      const floor = localStorage.getItem('ml-lastseen');
      const { people } = app.masterData[floor];
      let name = 'Not available';
      if(people && people[seat]) {
        name = people[seat];
      }
      document.getElementById('emp-seat').innerHTML = seat;
      document.getElementById('emp-name').innerHTML = name;
      document.getElementById('emp-details').classList.add('on');
    };
    const addOnFromSeat = el => {
      const seatno = el.classList.value.split('seat-')[1].split(' ')[0];
      showEmpDetails(seatno);
      el.classList.add('on');
    };
    window.findseat = () => {
      let seat = document.getElementById('seatno').value;
      if(seat === '') return;
      removeAllOn();
      if(!isNaN(seat)) {
        let svgseat = document.querySelector('.seat-' + seat);
        if(svgseat) {
          showEmpDetails(seat);
          svgseat.classList.add("on");
        } else {
          document.getElementById('not-found').classList.add('on');
        }
      } else if(teams[seat]) {
        for(let s of teams[seat]) {
          let svgseat = document.querySelector('.seat-' + s);
          svgseat && svgseat.classList.add("on");
        }
      } else {
        document.getElementById('not-found').classList.add('on');
      }
    };
    wordRooms.forEach(el => {
      el.addEventListener("click", () => {
        if(!el.classList.contains('on')) {
          removeAllOn();
          addOnFromList(el);
        } else {
          removeAllOn();
        }
      });
    });
    // highlight room details in the list when clicked on map
    svgRooms.forEach(r => {
      r.addEventListener('click', () => {
        if(r.classList.contains('on')) {
          removeAllOn();
        } else {
          removeAllOn();
          addOnFromRoom(r);
        }
      });
    });

    // show seat details when clicked on map
    svgSeats.forEach(s => {
      s.addEventListener('click', () => {
        if(s.classList.contains('on')) {
          removeAllOn();
        } else {
          removeAllOn();
          addOnFromSeat(s);
        }
      });
    });
    document.querySelectorAll('.close').forEach(el => {
      el.addEventListener('click', () => {
        removeAllOn();
      });
    });
    document.getElementById('seatno').onkeydown = function(e){
      if(e.keyCode === 13){
        findseat();
      }
    };
    removeAllOn();
  },
  drawSeats(seats) {
    const fsv = {
      '90':  'y30',
      '-90': 'x-15'
    };
    const fsh = {
      '90': 'y15',
      '-90': 'x-30'
    };
    const floor = localStorage.getItem('ml-lastseen');
    // triangle related data.
    const sideLength = floor === 'hallmark2' ? 80 : 72;
    const pi = 3.141592653589793238462643383;
    const halfSide = sideLength / 2;
    const innerHypotenuse = halfSide * (1 / Math.cos(30 * pi / 180));
    const tmp1 = Math.sqrt(3 * sideLength * sideLength / 16);
    const tmp2 = Math.sqrt(27 * sideLength * sideLength / 256);

    for (const seat of seats) {
      const center = seat[0];
    	const seatGroup = seat[1];
      const angles = seat[2];
      const isFlatSeatV = (seat[3] === 'fsv');
      const isFlatSeatH = (seat[3] === 'fsh');
    	for(let i = 0; i < seatGroup.length; i += 1) {
        let deg = angles[i];
        var newpath = document.createElementNS(NS, "path");
      	var path = `M${center[0] + CX} ${center[1] + CY} `;
        if(isFlatSeatV) {
          deg = fsv[`${deg}`] || deg;
        	path += 'l15 0 0 -30 -15 0 Z';
        } else if(isFlatSeatH) {
          deg = fsh[`${deg}`] || deg;
        	path += 'l30 0 0 -15 -30 0 Z';
        } else {
          if(floor.includes('hallmark') && seat[3] !== 'rect') {
            let topy = center[1] - innerHypotenuse,
              x1 = center[0],
              y1 = center[1],
              x2 = x1 + sideLength / 4,
              y2 = topy + tmp1,
              x3 = x1 + sideLength * 3 / 16,
              y3 = topy + tmp2,
              x4 = x1 - sideLength * 3 / 16,
              y4 = y3,
              x5 = x1 - sideLength / 4,
              y5 = y2,
              curve = ' C' + (x3 - 10) + ' ' + (y3 + 6) + ' ' + (x4 + 10) + ' ' + (y4 + 6) + ' ' + x4 + ' ' + y4;
              path = 'M' + x1 + ' ' + y1 + ' L' + x2 + ' ' + y2 + ' L' + x3 + ' ' + y3 + curve + ' L' + x5 + ' ' + y5 + ' Z';
          } else if(floor.includes('touchstone')) {
            path += 'l50 0 0 -18 -12 0 -20 -20 0 -12 -18 0 Z';
          } else {
            path += 'l30 0 0 -12 -6 0 -12 -12 0 -6 -12 0 Z';
          }
        }
        newpath.setAttribute('d', path);
        newpath.setAttribute('class', `seat rotate${deg} seat-${seatGroup[i]}`);
        newpath.setAttribute('style', `transform-origin :${center[0] + CX}px ${center[1] + CY}px`);
        NODE.appendChild(newpath);
      }
    }
  },
  drawPillars(pillars) {
    let len = pillars.length;
    for(let p = 0; p < len; p += 1) {
      let cp = pillars[p];
      let rect = document.createElementNS(NS, "rect");
      rect.setAttribute('x', cp[0]);
      rect.setAttribute('y', cp[1]);
      rect.setAttribute('width', 17);
      rect.setAttribute('height', 17);
      rect.setAttribute('fill', '#999');
      rect.setAttribute('stroke', '#999');
      NODE.appendChild(rect);
    }
  },
  drawCollaborationSeats() {
    const collabs = document.querySelectorAll('.collab');
    const centers = [[-10,-10], [10,-10], [10,10], [-10,10]];
    for(let collab of collabs) {
      let box = collab.getBBox();
      // find center of collab
      let _cx = box.x + box.width / 2;
      let _cy = box.y + box.height / 2;
      // draw four round-shaped chairs/seats
      for(let c of centers) {
        let circle = document.createElementNS(NS, "circle");
        circle.setAttribute('cx', c[0] + _cx + CX);
        circle.setAttribute('cy', c[1] + _cy + CY);
        circle.setAttribute('r', 5);
        NODE.appendChild(circle);
      }
    }
  },
  drawRooms(allrooms) {
    const draw = (rooms, cl) => {
      for(let room of rooms) {
        let newpath = document.createElementNS(NS, "path");
        let { path, curve } = room;
        let len = path.length;
        let svgpath = `M${path[0] + CX} ${path[1] + CY}`;
        for(let i = 2; i < len; i += 2) {
          svgpath += ' l' + path[i] + ' ' + path[i + 1];
        }
        if(curve) {
          svgpath += ' c'
          for(let i = 0; i < curve.length; i += 2) {
            svgpath += ' ' + curve[i] + ' ' + curve[i + 1];
          }
        } else {
          svgpath += ' Z';
        }
        newpath.setAttribute('d', svgpath);

        let classname = `${cl || ''} ${room.type || ''} ${room.code || ''}`;
        classname = classname.trim();
        newpath.setAttribute('class', classname);
        if(room.name || room.code) {
          newpath.setAttribute('data-mrname', room.name || room.code);
        }
        if(room.type === 'collab') {
          newpath.setAttribute('stroke-width', 0);
        }
        NODE.appendChild(newpath);
      }
    };
    allrooms.list && draw(allrooms.list, 'meet-room');
    allrooms.maponly && draw(allrooms.maponly);
  },
  labelRooms() {
    let rooms = document.querySelectorAll('[data-mrname]');
    for(let room of rooms) {
      let name = room.getAttribute('data-mrname');
      if (!name) {
        continue;
      }
      let t = document.createElementNS("http://www.w3.org/2000/svg", "text");
      let b = room.getBBox();
      let dy = b.y + b.height/2;
      let dx = b.x + 10;
      switch (name) {
        case 'Janitor':
          dy = b.y + b.height - 10;
          break;
        case 'Pantry 1':
        case 'Pantry':
          dx = b.x + b.width / 2;
          dy = b.y + 60;
          break;
        case 'Stairs':
          dx = b.x + b.width / 2;
          break;
        default:
      }
      t.setAttribute("transform", "translate(" + dx + " " + dy + ")");
      t.textContent = name;
      t.setAttribute("fill", "red");
      t.setAttribute("font-size", "11");
      t.setAttribute("font-family", "Verdana");
      t.setAttribute("font-weight", "100");
      room.parentNode.insertBefore(t, room.nextSibling);
    }
  },
  populateRoomsList(list) {
    let listarr = [];
    const ul = document.getElementById('list-of-rooms');
    for (item of list) {
      let name = item.name || item.code || item.type;
      let code = item.code || item.type;
      const { projector, capacity } = item;
      if(name) {
        if(listarr.findIndex(item => item.name === name) === -1) {
          listarr.push({name, code, projector, capacity});
        }
      }
    }
    listarr.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));
    for(item of listarr) {
      let _name = item.name;
      if(item.capacity) {
        _name += ` - ${item.capacity}S`;
      }
      const li = document.createElement('li');
      li.setAttribute('data-name', item.code);
      if(item.projector) {
        li.setAttribute('class', 'tv-projector');
      }
      li.appendChild(document.createTextNode(_name));
      ul.appendChild(li);
    }
  },
  init() {
    const lastseen = localStorage.getItem('ml-lastseen') || 'aura5';
    localStorage.setItem('ml-lastseen', lastseen);
    app.menuEventHandlers();
    app.masterData = {
      "aura5": {
        "seats": [
          [[197,30],[535],[90]],
          [[197,60],[534],[90]],
          [[197,120],[533,532],[0,90]],
          [[197,180],[531],[0]],
          [[197,215],[530],[90]],
          [[197,275],[529,528],[0,90]],
          [[197,335],[527,526],[0,90]],
          [[197,395],[525],[0]],

          [[277,30],[545,536],[90,180]],
          [[277,60],[544,537],[90,180]],
          [[277,120],[543,542,539,538],[0,90,180,-90]],
          [[277,180],[541,540],[0,-90]],
          [[277,215],[518,519],[90,180]],
          [[277,275],[517,516,521,520],[0,90,180,-90]],
          [[277,335],[515,514,523,522],[0,90,180,-90]],
          [[277,395],[513,524],[0,-90]],

          [[357,30],[555,546],[90,180]],
          [[357,60],[554,547],[90,180]],
          [[357,120],[553,552,549,548],[0,90,180,-90]],
          [[357,180],[551,550],[0,-90]],
          [[357,215],[507],[180]],
          [[357,275],[506,505,509,508],[0,90,180,-90]],
          [[357,335],[504,503,511,510],[0,90,180,-90]],
          [[357,395],[502,512],[0,-90]],

          [[437,30],[556],[180]],
          [[437,60],[557],[180]],
          [[437,120],[559,558],[180,-90]],
          [[437,180],[560],[-90]],
          [[437,215],[496],[180]],
          [[437,275],[498,497],[180,-90]],
          [[437,335],[500,499],[180,-90]],
          [[437,395],[501],[-90]],

          [[485,30],[566,565],["y30",180],"fsv"],
          [[485,60],[567,564],["y30",180],"fsv"],
          [[485,120],[568,569,562,563],[0,"y30",180,"x-15"],"fsv"],
          [[485,180],[570,561],[0,"x-15"],"fsv"],
          [[485,215],[484,495],["y30",180],"fsv"],
          [[485,275],[485,486,493,494],[0,"y30",180,"x-15"],"fsv"],
          [[485,335],[487,488,491,492],[0,"y30",180,"x-15"],"fsv"],
          [[485,395],[489,490],[0,"x-15"],"fsv"],

          [[532,30],[575],[90]],
          [[532,60],[574],[90]],
          [[532,120],[573,572],[0,90]],
          [[532,180],[571],[0]],
          [[532,215],[483],[90]],
          [[532,275],[482,481],[0,90]],
          [[532,335],[480,479],[0,90]],
          [[532,395],[478],[0]],

          [[612,30],[585,576],[90,180]],
          [[612,60],[584,577],[90,180]],
          [[612,120],[583,582,579,578],[0,90,180,-90]],
          [[612,180],[581,580],[0,-90]],
          [[612,215],[472],[90]],
          [[612,275],[471,470,474,473],[0,90,180,-90]],
          [[612,335],[469,468,476,475],[0,90,180,-90]],
          [[612,395],[467,477],[0,-90]],

          [[692,30],[586],[180]],
          [[692,60],[587],[180]],
          [[692,120],[589,588],[180,-90]],
          [[692,180],[590],[-90]],
          [[692,215],[461],[180]],
          [[692,275],[463,462],[180,-90]],
          [[692,335],[465,464],[180,-90]],
          [[692,395],[466],[-90]],

          [[740,30],[595],[180]],
          [[740,60],[594],[180]],
          [[740,120],[592,593],[180,-90]],
          [[740,180],[591],[-90]],
          [[740,215],[460],[180]],
          [[740,275],[458,459],[180,-90]],
          [[740,335],[456,457],[180,-90]],
          [[740,395],[455],[-90]],

          [[1068,55],[610,605,604,611],[0,"y15",180,"x-30"],"fsh"],
          [[1128,55],[608,607,606,609],[0,"y15",180,"x-30"],"fsh"],
          [[1128,120],[600,599,598,601],[0,"y15",180,"x-30"],"fsh"],
          [[1068,120],[602,597,596,603],[0,"y15",180,"x-30"],"fsh"],

          [[1590,30],[450],[90]],
          [[1590,60],[451],[90]],
          [[1590,120],[452,453],[0,90]],
          [[1590,180],[454],[0]],
          [[1590,215],[380],[90]],
          [[1590,275],[381,382],[0,90]],
          [[1590,335],[383,384],[0,90]],
          [[1590,395],[385],[0]],

          [[1670,30],[440,449],[90,180]],
          [[1670,60],[441,448],[90,180]],
          [[1670,120],[442,443,446,447],[0,90,180,-90]],
          [[1670,180],[444,445],[0,-90]],
          [[1670,215],[379],[180]],
          [[1670,275],[369,370,377,378],[0,90,180,-90]],
          [[1670,335],[371,372,375,376],[0,90,180,-90]],
          [[1670,395],[373,374],[0,-90]],

          [[1750,30],[439],[180]],
          [[1750,60],[438],[180]],
          [[1750,120],[436,437],[180,-90]],
          [[1750,180],[435],[-90]],
          [[1750,215],[368],[180]],
          [[1750,275],[366,367],[180,-90]],
          [[1750,335],[364,365],[180,-90]],
          [[1750,395],[363],[-90]],

          [[1798,30],[429,430],["y30",180],"fsv"],
          [[1798,60],[428,431],["y30",180],"fsv"],
          [[1798,120],[427,426,433,432],[0,"y30",180,"x-15"],"fsv"],
          [[1798,180],[425,434],[0,"x-15"],"fsv"],
          [[1798,215],[356,357],["y30",180],"fsv"],
          [[1798,275],[355,354,359,358],[0,"y30",180,"x-15"],"fsv"],
          [[1798,335],[353,352,361,360],[0,"y30",180,"x-15"],"fsv"],
          [[1798,395],[351,362],[0,"x-15"],"fsv"],

          [[1845,30],[420],[90]],
          [[1845,60],[421],[90]],
          [[1845,120],[422,423],[0,90]],
          [[1845,180],[424],[0]],
          [[1845,215],[345],[90]],
          [[1845,275],[346,347],[0,90]],
          [[1845,335],[348,349],[0,90]],
          [[1845,395],[350],[0]],

          [[1925,30],[410,419],[90,180]],
          [[1925,60],[411,418],[90,180]],
          [[1925,120],[412,413,416,417],[0,90,180,-90]],
          [[1925,180],[414,415],[0,-90]],
          [[1925,215],[334],[90]],
          [[1925,275],[335,336,343,344],[0,90,180,-90]],
          [[1925,335],[337,338,341,342],[0,90,180,-90]],
          [[1925,395],[339,340],[0,-90]],
          [[1925,430],[321],[90]],
          [[1925,490],[322,323],[0,90]],
          [[1925,550],[324,325],[0,90]],
          [[1925,610],[326],[0]],
          [[1925,640],[327],[0]],

          [[2005,30],[400,409],[90,180]],
          [[2005,60],[401,408],[90,180]],
          [[2005,120],[402,403,406,407],[0,90,180,-90]],
          [[2005,180],[404,405],[0,-90]],
          [[2005,215],[333],[180]],
          [[2005,275],[331,332],[180,-90]],
          [[2005,335],[329,330],[180,-90]],
          [[2005,395],[328],[-90]],
          [[2005,430],[307,320],[90,180]],
          [[2005,490],[308,309,318,319],[0,90,180,-90]],
          [[2005,550],[310,311,316,317],[0,90,180,-90]],
          [[2005,610],[312,315],[0,-90]],
          [[2005,640],[313,314],[0,-90]],

          [[2085,30],[390,399],[90,180]],
          [[2085,60],[391,398],[90,180]],
          [[2085,120],[392,393,396,397],[0,90,180,-90]],
          [[2085,180],[394,395],[0,-90]],
          [[2085,430],[306],[180]],
          [[2085,490],[304,305],[180,-90]],

          [[2165,60],[389],[180]],
          [[2165,120],[387,388],[180,-90]],
          [[2165,180],[386],[-90]]
        ],
        "pillars": [
          [0,0],[140,0],[360,0],[582,0],[787,0],[1005,0],[1223,0],[1446,0],[1671,0],[1896,0],
          [0,217],[140,217],[360,217],[582,217],[787,217],[1005,217],[1223,217],[1446,217],[1671,217],[1896,217],[2121,217],
          [0,434],[140,434],[360,434],[582,434],[787,434],[1005,434],[1671,434],[1896,434],[2121,434]
        ],
        "rooms": {
          "list": [
            {"type":"meeting","code":"murudjanjira","name":"Murud Janjira Fort","path":[0,80,160,0,0,105,-160,0],"projector":true,"capacity":14},
            {"type":"meeting","code":"kangra","name":"Kangra Fort","path":[245,430,68,0,0,100,-68,-6],"projector":true,"capacity":4},
            {"type":"meeting","code":"isdexec2","name":"ISD Executive Rm 2","path":[313,430,68,0,0,105.8,-68,-5.8],"projector":true,"capacity":4},
            {"type":"meeting","code":"namakkal","name":"Namakkal Fort","path":[760,30,154,0,0,90,-154,0],"projector":true,"capacity":12},
            {"type":"meeting","code":"payal","name":"Payal Fort","path":[867,120,64,0,0,59,-64,0],"projector":true,"capacity":4},
            {"type":"meeting","code":"jhansi","name":"Jhansi Fort","path":[760,265,85,0,0,130,-85,0],"projector":true,"capacity":10},
            {"type":"meeting","code":"isdexec1","name":"ISD Executive Rm 1","path":[1230,117,64,0,0,62,-64,0],"projector":true,"capacity":4},
            {"type":"meeting","code":"penukonda","name":"Penukonda Fort","path":[1294,20,172,0,0,97,-172,0],"projector":true,"capacity":14},
            {"type":"meeting","code":"redfort","name":"Red Fort","path":[1468,20,80,0,0,132,-80,0],"projector":true,"capacity":10},
            {"type":"oneonone","code":"kurumbera","name":"Kurumbera Fort","path":[197,430,48,0,0,46,-48,0]},
            {"type":"oneonone","code":"manjarabad","name":"Manjarabad Fort","path":[197,476,48,0,0,48,-48,-4]},
            {"type":"oneonone","name":"1 ON 1","path":[1168,215,52,0,0,45,-52,0]},
            {"type":"oneonone","name":"1 ON 1","path":[2120,215,58,0,-12,83,-46,0]},
            {"type":"oneonone","name":"1 ON 1","path":[1247,215,53,0,0,45,-53,0]},
            {"type":"interview","code":"jaisalmer","name":"Jaisalmer Fort","path":[1168,260,66,0,0,63,-66,0],"projector":true},
            {"type":"interview","code":"itafort","name":"Ita Fort","path":[1234,260,66,0,0,63,-66,0],"projector":true},
            {"type":"interview","code":"golkonda","name":"Golkonda Fort","path":[1366,330,66,0,0,65,-66,0],"projector":true},
            {"type":"interview","code":"diufort","name":"Diu Fort","path":[1432,330,66,0,0,65,-66,0],"projector":true},
            {"type":"interview","name":"Interview","path":[1300,330,66,0,0,65,-66,0]},
            {"type":"call","code":"palamu","name":"Palamu Fort","path":[788,215,57,0,0,50,-57,0]},
            {"type":"call","code":"chiktan","name":"Chiktan Fort","path":[1498,330,50,0,0,32,-50,0]},
            {"type":"call","code":"deogarh","name":"Deogarh Fort","path":[1498,362,50,0,0,33,-50,0]},
            {"type":"call","code":"barabati","name":"Barabati Fort","path":[2040,298,40,0,0,50,-40,0]},
            {"type":"call","code":"bekal","name":"Bekal Fort","path":[2040,348,40,0,0,50,-40,0]},
            {"type":"printer","path":[110,215,20,0,0,20,-20,0]},
            {"type":"printer","path":[765,240,20,0,0,20,-20,0]},
            {"type":"printer","path":[1480,154,20,0,0,20,-20,0]},
            {"type":"printer","path":[2090,375,20,0,0,20,-20,0]},
            {"type":"lift","name":"Lift","path":[1125,430,65,0,0,56,-65,0]},
            {"type":"lift","name":"Lift","path":[1135,486,55,0,0,56,-55,0]},
            {"type":"lift","name":"Lift","path":[1135,542,55,0,0,56,-55,0]},
            {"type":"lift","name":"Lift","path":[1280,486,55,0,0,56,-55,0]},
            {"type":"lift","name":"Lift","path":[1280,542,55,0,0,56,-55,0]},
            {"type":"collab","path":[0,0,160,0,0,80,-160,0]},
            {"type":"collab","path":[381,430,109,0,0,106,-109,0]},
            {"type":"collab","path":[670,430,68,0,0,70,-68,0]},
            {"type":"collab","path":[760,120,107,0,0,59,-107,0]},
            {"type":"collab","path":[1200,20,93,0,0,90,-93,0]},
            {"type":"collab","path":[1335,117,90,0,0,50,-90,0]},
            {"type":"collab","path":[2145,0,50,0,0,50,-50,0]},
            {"type":"collab","path":[2040,215,80,0,0,83,-80,0]},
            {"type":"collab","path":[2080,298,85,0,-10,83,-75,0]},
            {"type":"washroom","code":"ladiestoilet","name":"Ladies Toilet","path":[978,475,82,0,0,118,-82,-7]},
            {"type":"washroom","code":"ladiestoilet","name":"Ladies Toilet","path":[1572,497,47,0,0,143,-85,-7,0,-107,37,0]},
            {"type":"washroom","code":"gentstoilet","name":"Gents Toilet","path":[864,430,82,0,0,153.5,-82,-7]},
            {"type":"washroom","code":"gentstoilet","name":"Gents Toilet","path":[1469,465,65,0,0,61,-25,0,0,104.8,-87,-6.9,0,-118.9,47,0]},
            {"type":"pantry","code":"pantry1","name":"Pantry 1","path":[1750,430,175,0,0,236,-94,-8,0,-138,-81,0]},
            {"type":"pantry","code":"pantry2","name":"Pantry 2","path":[0,237,160,0,0,280,-160,-14]},
            {"code":"ithelpdesk","name":"IT Help Desk","path":[1004,0,195,0,0,179,-195,0]},
            {"code":"reception","name":"Reception","path":[1174,330,119,0,0,65,-119,0]},
            {"code":"liftlobby","name":"Lift Lobby","path":[1190,430,90,0,0,182,-90,-8]}
          ],
          "maponly": [
            {"code":"ahu2","name":"AHU","path":[490,430,148,0,0,100,-148,0]},
            {"code":"stairs","name":"Stairs","path":[670,500,168,0,0,74.5,-138,-12,0,-30,-30,0]},
            {"code":"electrical2","name":"Electrical Rm 2","path":[738,430,100,0,0,70,-100,0]},
            {"code":"janitor","name":"Janitor","path":[978,430,50,0,0,45,-50,0]},
            {"code":"itstore","name":"IT Store","path":[914,0,90,0,0,179,-73,0,0,-59,-17,0]},
            {"code":"pacroom","name":"PAC Room","path":[845,215,45,0,0,180,-45,0]},
            {"code":"idfroom","name":"IDF Room","path":[890,215,74,0,0,88,-74,0]},
            {"code":"staging","name":"Staging Room","path":[964,215,117,0,0,88,-117,0]},
            {"code":"server","name":"Sever Room","path":[890,303,152,0,0,92,-152,0]},
            {"code":"mdfroom","name":"MDF Room","path":[1042,303,126,0,0,92,-126,0]},
            {"code":"isproom","name":"ISP Room","path":[1081,215,87,0,0,88,-87,0]},
            {"code":"inergen","name":"Inergen","path":[1300,215,54,0,0,115,-54,0]},
            {"code":"upsroom","name":"UPS Room","path":[1354,215,144,0,0,115,-144,0]},
            {"code":"acroom","name":"AC Room","path":[1498,215,50,0,0,115,-50,0]},
            {"code":"stairs","name":"stairs","path":[1335,430,134,0,0,35,-47,0,0,158.8,-87,-7]},
            {"code":"janitor","name":"Janitor","path":[1469,430,65,0,0,35,-65,0]},
            {"code":"inclusivewr","name":"wash","path":[1572,430,47,0,0,67,-47,0]},
            {"code":"electrical1","name":"Electrical Rm 1","path":[1619,430,90,0,0,218,-90,-8]},
            {"code":"ahu1","name":"AHU","path":[1709,520,122,0,0,110,-122,0]},
            {"code":"battery","name":"Battery","path":[2085,430,62,0,-37,252,-55,-5,0,-155,30,0]},
            {"path":[490,530,148,0,0,27,-148,-12,0,-15,148,27,0,-27,-148,15]},
            {"path":[670,532.5,30,0,0,30,-30,-2.5,0,-27.5,30,30,0,-30,-30,27.5]},
            {"path":[670,480,25,0,0,20,-25,0,0,-20,25,20,0,-20,-25,20]},
            {"path":[838,430,26,0,0,70,-26,0,0,-70,26,70,0,-70,-26,70]},
            {"path":[838,500,26,0,0,76.5,-26,-2,0,-74.5,26,76.5,0,-76.5,-26,74.5]},
            {"path":[946,520,32,0,0,66,-32,-2.5,0,-63.5,32,66,0,-66,-32,63.5]},
            {"path":[1028,430,32,0,0,45,-32,0,0,-45,32,45,0,-45,-32,45]},
            {"path":[1115,486,20,0,0,113,-20,-1,0,-113,20,113,0,-113,-20,113]},
            {"path":[1280,430,55,0,0,56,-55,0,0,-56,55,56,0,-56,-55,56]},
            {"path":[1422,465,47,0,0,40,-47,0,0,-40,47,40,0,-40,-47,40]},
            {"path":[1509,526,25,0,0,107,-25,-2,0,-107,25,107,0,-107,-25,107]},
            {"path":[1709,630,122,0,0,28,-122,-10,0,-18,122,28,0,-28,-122,18]},
            {"path":[1060,430,65,0,0,56,-10,0,0,112,-55,-5]},
            {"path":[0,0,2210,0,-100,682,-2110,-179]}
          ]
        }
      },
      "aura4": {
        "seats": [
          [[37,30],[185],[90]],
          [[37,60],[184],[90]],
          [[37,120],[183,182],[0,90]],
          [[37,180],[181],[0]],

          [[117,30],[186],[180]],
          [[117,60],[194,187],[90,180]],
          [[117,120],[193,192,189,188],[0,90,180,-90]],
          [[117,180],[191,190],[0,-90]],

          [[197,30],[204,195],[90,180]],
          [[197,60],[203,196],[90,180]],
          [[197,120],[202,201,198,197],[0,90,180,-90]],
          [[197,180],[200,199],[0,-90]],
          [[197,215],[175],[90]],
          [[197,275],[176,177],[0,90]],
          [[197,335],[178,179],[0,90]],
          [[197,395],[180],[0]],

          [[277,30],[214,205],[90,180]],
          [[277,60],[213,206],[90,180]],
          [[277,120],[212,211,208,207],[0,90,180,-90]],
          [[277,180],[210,209],[0,-90]],
          [[277,215],[163,174],[90,180]],
          [[277,275],[164,165,172,173],[0,90,180,-90]],
          [[277,335],[166,167,170,171],[0,90,180,-90]],
          [[277,395],[168,169],[0,-90]],

          [[357,30],[224,215],[90,180]],
          [[357,60],[223,216],[90,180]],
          [[357,120],[222,221,218,217],[0,90,180,-90]],
          [[357,180],[220,219],[0,-90]],
          [[357,215],[162],[180]],
          [[357,275],[152,153,160,161],[0,90,180,-90]],
          [[357,335],[154,155,158,159],[0,90,180,-90]],
          [[357,395],[156,157],[0,-90]],

          [[437,30],[225],[180]],
          [[437,60],[226],[180]],
          [[437,120],[228,227],[180,-90]],
          [[437,180],[229],[-90]],
          [[437,215],[151],[180]],
          [[437,275],[149,150],[180,-90]],
          [[437,335],[147,148],[180,-90]],
          [[437,395],[146],[-90]],

          [[485,60],[235,236,233,234],[0,90,180,-90],"fsv"],
          [[485,120],[237,238,231,232],[0,90,180,-90],"fsv"],
          [[485,180],[239,230],[0,-90],"fsv"],
          [[485,245],[139,138,141,140],[0,90,180,-90],"fsv"],
          [[485,305],[137,136,143,142],[0,90,180,-90],"fsv"],
          [[485,365],[135,134,145,144],[0,90,180,-90],"fsv"],

          [[532,30],[244],[90]],
          [[532,60],[243],[90]],
          [[532,120],[242,241],[0,90]],
          [[532,180],[240],[0]],
          [[532,215],[128],[90]],
          [[532,275],[129,130],[0,90]],
          [[532,335],[131,132],[0,90]],
          [[532,395],[133],[0]],

          [[612,30],[254,245],[90,180]],
          [[612,60],[253,246],[90,180]],
          [[612,120],[252,251,248,247],[0,90,180,-90]],
          [[612,180],[250,249],[0,-90]],
          [[612,275],[126,127],[180,-90]],
          [[612,335],[124,125],[180,-90]],
          [[612,395],[123],[-90]],

          [[692,30],[264,255],[90,180]],
          [[692,60],[263,256],[90,180]],
          [[692,120],[262,261,258,257],[0,90,180,-90]],
          [[692,180],[260,259],[0,-90]],

          [[772,30],[274,265],[90,180]],
          [[772,60],[273,266],[90,180]],
          [[772,120],[272,271,268,267],[0,90,180,-90]],
          [[772,180],[270,269],[0,-90]],

          [[852,30],[275],[180]],
          [[852,60],[276],[180]],
          [[852,120],[278,277],[180,-90]],
          [[852,180],[279],[-90]],

          [[840,360],[298,297],[0,-90],"fsh"],
          [[920,360],[300,299],[0,-90],"fsh"],
          [[950,360],[301],[0],"fsh"],
          [[1030,360],[303,302],[0,-90],"fsh"],
          [[840,320],[295,296],[0,-90],"fsh"],
          [[920,320],[293,294],[0,-90],"fsh"],
          [[950,320],[292],[0],"fsh"],
          [[1030,320],[290,291],[0,-90],"fsh"],
          [[860,280],[285,284],[0,-90],"fsh"],
          [[890,280],[286],[0],"fsh"],
          [[970,280],[288,287],[0,-90],"fsh"],
          [[1000,280],[289],[0],"fsh"],
          [[1412,18],[281,280],[0,-90],"fsh"],
          [[1412,81],[282,283],[0,-90],"fsh"],

          [[1730,30],[122],[90]],
          [[1730,60],[121],[90]],
          [[1730,120],[120,119],[0,90]],
          [[1730,180],[118],[0]],
          [[1730,215],[69],[90]],
          [[1730,275],[68,67],[0,90]],
          [[1730,335],[66,65],[0,90]],
          [[1730,395],[64],[0]],

          [[1810,30],[112,113],[90,180]],
          [[1810,60],[111,114],[90,180]],
          [[1810,120],[110,109,116,115],[0,90,180,-90]],
          [[1810,180],[108,117],[0,-90]],
          [[1810,215],[57,58],[90,180]],
          [[1810,275],[56,55,60,59],[0,90,180,-90]],
          [[1810,335],[54,53,62,61],[0,90,180,-90]],
          [[1810,395],[52,63],[0,-90]],

          [[1890,30],[102,103],[90,180]],
          [[1890,60],[101,104],[90,180]],
          [[1890,120],[100,99,106,105],[0,90,180,-90]],
          [[1890,180],[98,107],[0,-90]],
          [[1890,215],[46],[180]],
          [[1890,275],[45,44,48,47],[0,90,180,-90]],
          [[1890,335],[43,42,50,49],[0,90,180,-90]],
          [[1890,395],[41,51],[0,-90]],
          [[1925,430],[22],[90]],
          [[1925,490],[23,24],[0,90]],
          [[1925,550],[25,26],[0,90]],
          [[1925,610],[27],[0]],
          [[1925,640],[28],[0]],

          [[1970,30],[92,93],[90,180]],
          [[1970,60],[91,94],[90,180]],
          [[1970,120],[90,89,96,95],[0,90,180,-90]],
          [[1970,180],[88,97],[0,-90]],
          [[1970,215],[35],[180]],
          [[1970,275],[37,36],[180,-90]],
          [[1970,335],[39,38],[180,-90]],
          [[1970,395],[40],[-90]],
          [[2005,430],[8,21],[90,180]],
          [[2005,490],[9,10,19,20],[0,90,180,-90]],
          [[2005,550],[11,12,17,18],[0,90,180,-90]],
          [[2005,610],[13,16],[0,-90]],
          [[2005,640],[14,15],[0,-90]],

          [[2020,215],[34],[180]],
          [[2020,275],[32,33],[180,-90]],
          [[2020,335],[30,31],[180,-90]],
          [[2020,395],[29],[-90]],

          [[2050,30],[82,83],[90,180]],
          [[2050,60],[81,84],[90,180]],
          [[2050,120],[80,79,86,85],[0,90,180,-90]],
          [[2050,180],[78,87],[0,-90]],
          [[2085,430],[7],[180]],
          [[2085,490],[5,6],[180,-90]],
          [[2085,550],[3,4],[180,-90]],
          [[2085,610],[2],[-90]],
          [[2085,640],[1],[-90]],

          [[2130,60],[73,74],[90,180]],
          [[2130,120],[72,71,76,75],[0,90,180,-90]],
          [[2130,180],[70,77],[0,-90]]
        ],
        "pillars": [
          [0,0],[140,0],[360,0],[582,0],[787,0],[1005,0],[1223,0],[1446,0],[1671,0],[1896,0],
          [0,217],[140,217],[360,217],[582,217],[787,217],[1005,217],[1223,217],[1446,217],[1671,217],[1896,217],[2121,217],
          [0,434],[140,434],[360,434],[582,434],[787,434],[1005,434],[1671,434],[1896,434],[2121,434]
        ],
        "rooms": {
          "list": [
            {"type":"meeting","code":"mahavira","name":"Mahavira","path":[245,430,68,0,0,100,-68,-6],"projector":true,"capacity":4},
            {"type":"meeting","code":"touchbase1","name":"Touch Base 1","path":[313,430,68,0,0,105.8,-68,-5.8],"projector":true,"capacity":4},
            {"type":"meeting","code":"narayandapandit","name":"Narayanda Pandit","path":[887,30,145,0,0,90,-145,0],"projector":true,"capacity":12},
            {"type":"meeting","code":"parameshwara","name":"Parameshwara","path":[1032,30,100,0,0,70,-100,0],"projector":true,"capacity":6},
            {"type":"meeting","code":"touchbase2","name":"Touch Base 2","path":[902,120,65,0,0,59,-65,0],"projector":true,"capacity":4},
            {"type":"meeting","code":"touchbase3","name":"Touch Base 3","path":[1630,30,65,0,0,59,-65,0],"projector":true,"capacity":4},
            {"type":"meeting","code":"discroom","name":"Disc Rm","path":[967,120,65,0,0,59,-65,0],"projector":true,"capacity":4},
            {"type":"meeting","code":"lopamudra","name":"Lopamudra","path":[640,330,97,0,0,65,-97,0],"projector":true,"capacity":4},
            {"type":"meeting","code":"panini","name":"Panini","path":[1132,30,226,0,0,97,-226,0],"projector":true,"capacity":18},
            {"type":"meeting","code":"s8","name":"8S","path":[1357,215,80,0,0,115,-80,0],"projector":true,"capacity":8},
            {"type":"meeting","code":"ramanujan","name":"Srinivasa Ramanujan","path":[1540,85,155,0,0,93,-155,0],"projector":true,"capacity":12},
            {"type":"meeting","code":"cvraman","name":"CV Raman","path":[1556,315,110,0,0,80,-110,0],"projector":true,"capacity":8},
            {"type":"oneonone","code":"mahendrasuri","name":"Mahendrasuri","path":[197,430,48,0,0,46,-48,0]},
            {"type":"oneonone","code":"maitareyi","name":"Maitareyi","path":[197,476,48,0,0,48,-48,-4]},
            {"type":"oneonone","code":"aryabhata","name":"Aryabhata","path":[2120,215,58,0,-12,83,-46,0]},
            {"type":"interview","code":"kamalakara","name":"Kamalakara","path":[1358,330,66,0,0,65,-66,0]},
            {"type":"interview","code":"homibhabha","name":"Homi Bhabha","path":[1424,330,66,0,0,65,-66,0],"projector":true},
            {"type":"interview","code":"gargi","name":"Gargi","path":[1490,330,66,0,0,65,-66,0],"projector":true},
            {"type":"call","code":"munishvara","name":"Munishvara","path":[640,215,97,0,0,115,-97,0],"projector":true,"capacity":8},
            {"type":"call","code":"bramhagupta","name":"Bramhagupta","path":[1640,237,51,0,0,38,-51,0]},
            {"type":"call","code":"Charaka","name":"charaka","path":[1640,275,51,0,0,38,-51,0]},
            {"type":"call","code":"baudhyayana","name":"Baudhyayana","path":[2040,298,40,0,0,50,-40,0]},
            {"type":"call","code":"bhaskara","name":"Bhaskara","path":[2040,348,40,0,0,50,-40,0]},
            {"type":"printer","path":[110,215,20,0,0,20,-20,0]},
            {"type":"printer","path":[882,130,20,0,0,20,-20,0]},
            {"type":"printer","path":[2090,375,20,0,0,20,-20,0]},
            {"type":"printer","path":[1666,315,20,0,0,20,-20,0]},
            {"type":"lift","name":"Lift","path":[1125,430,65,0,0,56,-65,0]},
            {"type":"lift","name":"Lift","path":[1135,486,55,0,0,56,-55,0]},
            {"type":"lift","name":"Lift","path":[1135,542,55,0,0,56,-55,0]},
            {"type":"lift","name":"Lift","path":[1280,486,55,0,0,56,-55,0]},
            {"type":"lift","name":"Lift","path":[1280,542,55,0,0,56,-55,0]},
            {"type":"collab","path":[381,430,109,0,0,106,-109,0]},
            {"type":"collab","path":[1190,110,93,0,0,90,-93,0]},
            {"type":"collab","path":[2145,0,50,0,0,50,-50,0]},
            {"type":"collab","path":[2040,215,80,0,0,83,-80,0]},
            {"type":"collab","path":[2080,298,85,0,-10,83,-75,0]},
            {"type":"washroom","code":"ladiestoilet","name":"Ladies Toilet","path":[978,475,82,0,0,118,-82,-7]},
            {"type":"washroom","code":"ladiestoilet","name":"Ladies Toilet","path":[1572,497,47,0,0,143,-85,-7,0,-107,37,0]},
            {"type":"washroom","code":"gentstoilet","name":"Gents Toilet","path":[864,430,82,0,0,153.5,-82,-7]},
            {"type":"washroom","code":"gentstoilet","name":"Gents Toilet","path":[1469,465,65,0,0,61,-25,0,0,104.8,-87,-6.9,0,-118.9,47,0]},
            {"type":"pantry","code":"pantry1","name":"Pantry 1","path":[1750,430,175,0,0,236,-94,-8,0,-138,-81,0]},
            {"type":"pantry","code":"pantry2","name":"Pantry 2","path":[0,237,160,0,0,280,-160,-14]},
            {"code":"noc","name":"NOC Rm","path":[737,215,400,0,0,180,-400,0]},
            {"code":"ecrew","name":"E-Crew","path":[1358,0,135,0,0,85,-135,0]},
            {"code":"reception","name":"Reception","path":[1137,215,220,0,0,180,-220,0]},
            {"code":"liftlobby","name":"Lift Lobby","path":[1190,430,90,0,0,182,-90,-8]}
          ],
          "maponly": [
            {"code":"financestore","name":"Finance Store","path":[1436,215,118,0,0,115,-118,0]},
            {"code":"hrstore","name":"HR Store","path":[1554,215,118,0,0,20,-31,0,0,80,-87,0]},
            {"code":"bmsroom","name":"BMS Room","path":[1540,0,90,0,0,85,-90,0]},
            {"code":"ecrewstore","name":"ECrew Store","path":[1358,85,155,0,0,93,-155,0]},
            {"code":"security","name":"Security","path":[670,430,68,0,0,70,-68,0]},
            {"code":"idfroom","name":"IDF Room","path":[1062,100,70,0,0,79,-70,0]},
            {"code":"ahu2","name":"AHU","path":[490,430,148,0,0,100,-148,0]},
            {"code":"stairs","name":"Stairs","path":[670,500,168,0,0,74.5,-138,-12,0,-30,-30,0]},
            {"code":"electrical","name":"Electrical Rm","path":[738,430,100,0,0,70,-100,0]},
            {"code":"janitor","name":"Janitor","path":[978,430,50,0,0,45,-50,0]},
            {"code":"stairs","name":"stairs","path":[1335,430,134,0,0,35,-47,0,0,158.8,-87,-7]},
            {"code":"janitor","name":"Janitor","path":[1469,430,65,0,0,35,-65,0]},
            {"code":"inclusivewr","name":"wash","path":[1572,430,47,0,0,67,-47,0]},
            {"code":"electrical","name":"Electrical Rm","path":[1619,430,90,0,0,218,-90,-8]},
            {"code":"ahu1","name":"AHU","path":[1709,520,122,0,0,110,-122,0]},
            {"path":[490,530,148,0,0,27,-148,-12,0,-15,148,27,0,-27,-148,15]},
            {"path":[670,532.5,30,0,0,30,-30,-2.5,0,-27.5,30,30,0,-30,-30,27.5]},
            {"path":[670,480,25,0,0,20,-25,0,0,-20,25,20,0,-20,-25,20]},
            {"path":[838,430,26,0,0,70,-26,0,0,-70,26,70,0,-70,-26,70]},
            {"path":[838,500,26,0,0,76.5,-26,-2,0,-74.5,26,76.5,0,-76.5,-26,74.5]},
            {"path":[946,520,32,0,0,66,-32,-2.5,0,-63.5,32,66,0,-66,-32,63.5]},
            {"path":[1028,430,32,0,0,45,-32,0,0,-45,32,45,0,-45,-32,45]},
            {"path":[1115,486,20,0,0,113,-20,-1,0,-113,20,113,0,-113,-20,113]},
            {"path":[1280,430,55,0,0,56,-55,0,0,-56,55,56,0,-56,-55,56]},
            {"path":[1422,465,47,0,0,40,-47,0,0,-40,47,40,0,-40,-47,40]},
            {"path":[1509,526,25,0,0,107,-25,-2,0,-107,25,107,0,-107,-25,107]},
            {"path":[1709,630,122,0,0,28,-122,-10,0,-18,122,28,0,-28,-122,18]},
            {"path":[1060,430,65,0,0,56,-10,0,0,112,-55,-5]},
            {"path":[0,0,2210,0,-100,682,-2110,-179]}
          ]
        }
      },
      "aura6": {
        "seats": [
          [[37,30],[835],[90]],
          [[37,60],[834],[90]],
          [[37,120],[833,832],[0,90]],
          [[37,180],[831],[0]],

          [[117,30],[836],[180]],
          [[117,60],[844,837],[90,180]],
          [[117,120],[843,842,839,838],[0,90,180,-90]],
          [[117,180],[841,840],[0,-90]],

          [[197,30],[854,845],[90,180]],
          [[197,60],[853,846],[90,180]],
          [[197,120],[852,851,848,847],[0,90,180,-90]],
          [[197,180],[850,849],[0,-90]],
          [[197,215],[830],[90]],
          [[197,275],[829,828],[0,90]],
          [[197,335],[827,826],[0,90]],
          [[197,395],[825],[0]],

          [[277,30],[864,855],[90,180]],
          [[277,60],[863,856],[90,180]],
          [[277,120],[862,861,858,857],[0,90,180,-90]],
          [[277,180],[860,859],[0,-90]],
          [[277,215],[818,819],[90,180]],
          [[277,275],[817,816,821,820],[0,90,180,-90]],
          [[277,335],[815,814,823,822],[0,90,180,-90]],
          [[277,395],[813,824],[0,-90]],

          [[357,30],[874,865],[90,180]],
          [[357,60],[873,866],[90,180]],
          [[357,120],[872,871,868,867],[0,90,180,-90]],
          [[357,180],[870,869],[0,-90]],
          [[357,215],[807],[180]],
          [[357,275],[806,805,809,808],[0,90,180,-90]],
          [[357,335],[804,803,811,810],[0,90,180,-90]],
          [[357,395],[802,812],[0,-90]],

          [[437,30],[875],[180]],
          [[437,60],[876],[180]],
          [[437,120],[878,877],[180,-90]],
          [[437,180],[879],[-90]],
          [[437,215],[796],[180]],
          [[437,275],[798,797],[180,-90]],
          [[437,335],[800,799],[180,-90]],
          [[437,395],[801],[-90]],

          [[485,60],[885,886,883,884],[0,90,180,-90],"fsv"],
          [[485,120],[887,888,881,882],[0,90,180,-90],"fsv"],
          [[485,180],[889,880],[0,-90],"fsv"],
          [[485,245],[784,785,794,795],[0,90,180,-90],"fsv"],
          [[485,305],[786,787,792,793],[0,90,180,-90],"fsv"],
          [[485,365],[788,789,790,791],[0,90,180,-90],"fsv"],

          [[532,30],[894],[90]],
          [[532,60],[893],[90]],
          [[532,120],[892,891],[0,90]],
          [[532,180],[890],[0]],
          [[532,215],[783],[90]],
          [[532,275],[782,781],[0,90]],
          [[532,335],[780,779],[0,90]],
          [[532,395],[778],[0]],

          [[612,30],[904,895],[90,180]],
          [[612,60],[903,896],[90,180]],
          [[612,120],[902,901,898,897],[0,90,180,-90]],
          [[612,180],[900,899],[0,-90]],
          [[612,215],[772],[90]],
          [[612,275],[771,770,774,773],[0,90,180,-90]],
          [[612,335],[769,768,776,775],[0,90,180,-90]],
          [[612,395],[767,777],[0,-90]],

          [[692,30],[905],[180]],
          [[692,60],[906],[180]],
          [[692,120],[908,907],[180,-90]],
          [[692,180],[909],[-90]],
          [[692,215],[761],[180]],
          [[692,275],[763,762],[180,-90]],
          [[692,335],[765,764],[180,-90]],
          [[692,395],[766],[-90]],

          [[740,30],[914],[180]],
          [[740,60],[913],[180]],
          [[740,120],[911,912],[180,-90]],
          [[740,180],[910],[-90]],
          [[740,215],[760],[180]],
          [[740,275],[758,759],[180,-90]],
          [[740,335],[756,757],[180,-90]],
          [[740,395],[755],[-90]],

          [[1590,30],[750],[90]],
          [[1590,60],[751],[90]],
          [[1590,120],[752,753],[0,90]],
          [[1590,180],[754],[0]],

          [[1670,30],[740,749],[90,180]],
          [[1670,60],[741,748],[90,180]],
          [[1670,120],[742,743,746,747],[0,90,180,-90]],
          [[1670,180],[744,745],[0,-90]],
          [[1670,275],[681,682],[0,90]],
          [[1670,335],[683,684],[0,90]],
          [[1670,395],[685],[0]],

          [[1750,30],[739],[180]],
          [[1750,60],[738],[180]],
          [[1750,120],[736,737],[180,-90]],
          [[1750,180],[735],[-90]],
          [[1750,215],[680],[180]],
          [[1750,275],[678,679],[180,-90]],
          [[1750,335],[676,677],[180,-90]],
          [[1750,395],[675],[-90]],

          [[1798,60],[729,728,731,730],[0,90,180,-90],"fsv"],
          [[1798,120],[727,726,733,732],[0,90,180,-90],"fsv"],
          [[1798,180],[725,734],[0,-90],"fsv"],
          [[1798,245],[668,667,670,669],[0,90,180,-90],"fsv"],
          [[1798,305],[666,665,672,671],[0,90,180,-90],"fsv"],
          [[1798,365],[664,663,674,673],[0,90,180,-90],"fsv"],

          [[1845,30],[720],[90]],
          [[1845,60],[721],[90]],
          [[1845,120],[722,723],[0,90]],
          [[1845,180],[724],[0]],
          [[1845,215],[657],[90]],
          [[1845,275],[658,659],[0,90]],
          [[1845,335],[660,661],[0,90]],
          [[1845,395],[662],[0]],

          [[1925,30],[710,719],[90,180]],
          [[1925,60],[711,718],[90,180]],
          [[1925,120],[712,713,716,717],[0,90,180,-90]],
          [[1925,180],[714,715],[0,-90]],
          [[1925,215],[646],[90]],
          [[1925,275],[647,648,655,656],[0,90,180,-90]],
          [[1925,335],[649,650,653,654],[0,90,180,-90]],
          [[1925,395],[651,652],[0,-90]],
          [[1925,430],[633],[90]],
          [[1925,490],[634,635],[0,90]],
          [[1925,550],[636,637],[0,90]],
          [[1925,610],[638],[0]],
          [[1925,640],[639],[0]],

          [[2005,30],[700,709],[90,180]],
          [[2005,60],[701,708],[90,180]],
          [[2005,120],[702,703,706,707],[0,90,180,-90]],
          [[2005,180],[704,705],[0,-90]],
          [[2005,215],[645],[180]],
          [[2005,275],[643,644],[180,-90]],
          [[2005,335],[641,642],[180,-90]],
          [[2005,395],[640],[-90]],
          [[2005,430],[619,632],[90,180]],
          [[2005,490],[620,621,630,631],[0,90,180,-90]],
          [[2005,550],[622,623,628,629],[0,90,180,-90]],
          [[2005,610],[624,627],[0,-90]],
          [[2005,640],[625,626],[0,-90]],

          [[2085,30],[690,699],[90,180]],
          [[2085,60],[691,698],[90,180]],
          [[2085,120],[692,693,696,697],[0,90,180,-90]],
          [[2085,180],[694,695],[0,-90]],
          [[2085,430],[618],[180]],
          [[2085,490],[616,617],[180,-90]],
          [[2085,550],[614,615],[180,-90]],
          [[2085,610],[613],[-90]],
          [[2085,640],[612],[-90]],

          [[2165,60],[689],[180]],
          [[2165,120],[687,688],[180,-90]],
          [[2165,180],[686],[-90]]
        ],
        "pillars": [
          [0,0],[140,0],[360,0],[582,0],[787,0],[1005,0],[1223,0],[1446,0],[1671,0],[1896,0],
          [0,217],[140,217],[360,217],[582,217],[787,217],[1005,217],[1223,217],[1446,217],[1671,217],[1896,217],[2121,217],
          [0,434],[140,434],[360,434],[582,434],[787,434],[1005,434],[1671,434],[1896,434],[2121,434]
        ],
        "rooms": {
          "list": [
            {"type":"meeting","code":"gaudsarang","name":"Gaud Sarang","path":[245,430,68,0,0,100,-68,-6],"projector":true,"capacity":4},
            {"type":"meeting","code":"touchbase1","name":"Touch Base 1","path":[313,430,68,0,0,105.8,-68,-5.8],"projector":true,"capacity":4},
            {"type":"meeting","code":"touchbase2","name":"Touch Base 2","path":[1490,90,60,0,0,60,-68,0],"projector":true,"capacity":4},
            {"type":"meeting","code":"khamaaj","name":"Khamaaj","path":[995,120,60,0,0,60,-60,0],"projector":true,"capacity":4},
            {"type":"meeting","code":"kosalam","name":"Kosalam","path":[1055,120,60,0,0,60,-60,0],"projector":true,"capacity":4},
            {"type":"meeting","code":"pilo","name":"Pilo","path":[1430,120,60,0,0,60,-60,0],"projector":true,"capacity":4},
            {"type":"meeting","code":"pahadi","name":"Pahadi","path":[1370,120,60,0,0,60,-60,0],"projector":true,"capacity":4},
            {"type":"meeting","code":"janya","name":"Janya","path":[760,30,125,0,0,80,-125,0],"projector":true,"capacity":10},
            {"type":"meeting","code":"kedar","name":"Kedar","path":[995,30,176,0,0,90,-176,0],"projector":true,"capacity":12},
            {"type":"meeting","code":"malhar","name":"Malhar","path":[1171,30,148,0,0,90,-148,0],"projector":true,"capacity":10},
            {"type":"meeting","code":"marwa","name":"Marwa","path":[1319,30,171,0,0,90,-171,0],"projector":true,"capacity":12},
            {"type":"meeting","code":"saarang","name":"Saarang","path":[1490,30,60,0,0,60,-60,0],"projector":true,"capacity":4},
            {"type":"meeting","code":"durga","name":"Durga","path":[760,275,85,0,0,120,-85,0],"projector":true,"capacity":8},
            {"type":"meeting","code":"malkauns","name":"Malkauns","path":[1300,215,80,0,0,115,-80,0],"projector":true,"capacity":8},
            {"type":"meeting","code":"bhoop","name":"Bhoop","path":[1563,280,60,0,0,65,-60,0],"projector":true,"capacity":4},
            {"type":"meeting","code":"bheempalasi","name":"Bheempalasi","path":[1563,215,60,0,0,65,-60,0],"projector":true,"capacity":4},
            {"type":"meeting","code":"takshashila1","name":"Takshashila 1","path":[917,235,126,0,0,160,-126,0],"projector":true,"capacity":22},
            {"type":"meeting","code":"takshashila2","name":"Takshashila 2","path":[1043,235,126,0,0,160,-126,0],"projector":true,"capacity":22},
            {"type":"oneonone","code":"hamir","name":"Hamir","path":[197,430,48,0,0,46,-48,0]},
            {"type":"oneonone","code":"hamsadhwani","name":"Hamsadhwani","path":[197,476,48,0,0,48,-48,-4]},
            {"type":"oneonone","name":"1 ON 1","path":[1168,215,52,0,0,45,-52,0]},
            {"type":"oneonone","code":"asawaari","name":"Asawaari","path":[2120,215,58,0,-12,83,-46,0]},
            {"type":"oneonone","name":"1 ON 1","path":[1247,215,53,0,0,45,-53,0]},
            {"type":"interview","code":"durbari","name":"Durbari","path":[1168,260,66,0,0,63,-66,0],"projector":true},
            {"type":"interview","code":"des","name":"Des","path":[1234,260,66,0,0,63,-66,0],"projector":true},
            {"type":"interview","code":"bhihag","name":"Bhihag","path":[1366,330,66,0,0,65,-66,0],"projector":true},
            {"type":"interview","code":"bhupali","name":"Bhupali","path":[1432,330,66,0,0,65,-66,0],"projector":true},
            {"type":"interview","code":"deepak","name":"Deepak","path":[1300,330,66,0,0,65,-66,0]},
            {"type":"call","code":"kanada","name":"Kanada","path":[788,215,57,0,0,60,-57,0]},
            {"type":"call","code":"jog","name":"Jog","path":[760,110,52,0,0,36,-52,0]},
            {"type":"call","code":"kafi","name":"Kafi","path":[760,146,52,0,0,36,-52,0]},
            {"type":"call","code":"bageshree","name":"Bageshree","path":[2040,298,40,0,0,50,-40,0]},
            {"type":"call","code":"bhairavi","name":"Bhairavi","path":[2040,348,40,0,0,50,-40,0]},
            {"type":"printer","path":[110,215,20,0,0,20,-20,0]},
            {"type":"printer","path":[1510,154,20,0,0,20,-20,0]},
            {"type":"printer","path":[2090,375,20,0,0,20,-20,0]},
            {"type":"lift","name":"Lift","path":[1125,430,65,0,0,56,-65,0]},
            {"type":"lift","name":"Lift","path":[1135,486,55,0,0,56,-55,0]},
            {"type":"lift","name":"Lift","path":[1135,542,55,0,0,56,-55,0]},
            {"type":"lift","name":"Lift","path":[1280,486,55,0,0,56,-55,0]},
            {"type":"lift","name":"Lift","path":[1280,542,55,0,0,56,-55,0]},
            {"type":"collab","path":[381,430,109,0,0,106,-109,0]},
            {"type":"collab","path":[812,110,73,0,0,72,-73,0]},
            {"type":"collab","path":[1380,215,183,0,0,115,-183,0]},
            {"type":"collab","path":[1165,117,90,0,0,50,-90,0]},
            {"type":"collab","path":[2145,0,50,0,0,50,-50,0]},
            {"type":"collab","path":[2040,215,80,0,0,83,-80,0]},
            {"type":"collab","path":[2080,298,85,0,-10,83,-75,0]},
            {"type":"washroom","code":"ladiestoilet","name":"Ladies Toilet","path":[978,475,82,0,0,118,-82,-7]},
            {"type":"washroom","code":"ladiestoilet","name":"Ladies Toilet","path":[1572,497,47,0,0,143,-85,-7,0,-107,37,0]},
            {"type":"washroom","code":"gentstoilet","name":"Gents Toilet","path":[864,430,82,0,0,153.5,-82,-7]},
            {"type":"washroom","code":"gentstoilet","name":"Gents Toilet","path":[1469,465,65,0,0,61,-25,0,0,104.8,-87,-6.9,0,-118.9,47,0]},
            {"type":"pantry","code":"pantry1","name":"Pantry 1","path":[1750,430,175,0,0,236,-94,-8,0,-138,-81,0]},
            {"type":"pantry","code":"pantry2","name":"Pantry 2","path":[0,237,160,0,0,280,-160,-14]},
            {"code":"reception","name":"Reception","path":[1174,330,119,0,0,65,-119,0]},
            {"code":"secontrol","name":"Secutiry","path":[845,265,72,0,0,130,-72,0]},
            {"code":"liftlobby","name":"Lift Lobby","path":[1190,430,90,0,0,182,-90,-8]},
            {"code":"malesick","name":"Male sick","path":[670,430,68,0,0,70,-68,0]},
            {"code":"femalesick","name":"Female sick","path":[1498,330,65,0,0,65,-65,0]},
            {"code":"mothers","name":"Mother's Rm","path":[1563,345,60,0,0,50,-60,0]}
          ],
          "maponly": [
            {"code":"store","name":"Store","path":[885,0,110,0,0,85,-110,0]},
            {"code":"surveillance","name":"Surveillance","path":[845,215,72,0,0,50,-72,0]},
            {"code":"idfroom","name":"IDF Rm","path":[920,85,75,0,0,95,-75,0]},
            {"code":"ahu2","name":"AHU","path":[490,430,148,0,0,100,-148,0]},
            {"code":"stairs","name":"Stairs","path":[670,500,168,0,0,74.5,-138,-12,0,-30,-30,0]},
            {"code":"electrical","name":"Electrical Rm","path":[738,430,100,0,0,70,-100,0]},
            {"code":"janitor","name":"Janitor","path":[978,430,50,0,0,45,-50,0]},
            {"code":"stairs","name":"stairs","path":[1335,430,134,0,0,35,-47,0,0,158.8,-87,-7]},
            {"code":"janitor","name":"Janitor","path":[1469,430,65,0,0,35,-65,0]},
            {"code":"inclusivewr","name":"wash","path":[1572,430,47,0,0,67,-47,0]},
            {"code":"electrical","name":"Electrical Rm","path":[1619,430,90,0,0,218,-90,-8]},
            {"code":"ahu1","name":"AHU","path":[1709,520,122,0,0,110,-122,0]},
            {"path":[490,530,148,0,0,27,-148,-12,0,-15,148,27,0,-27,-148,15]},
            {"path":[670,532.5,30,0,0,30,-30,-2.5,0,-27.5,30,30,0,-30,-30,27.5]},
            {"path":[670,480,25,0,0,20,-25,0,0,-20,25,20,0,-20,-25,20]},
            {"path":[838,430,26,0,0,70,-26,0,0,-70,26,70,0,-70,-26,70]},
            {"path":[838,500,26,0,0,76.5,-26,-2,0,-74.5,26,76.5,0,-76.5,-26,74.5]},
            {"path":[946,520,32,0,0,66,-32,-2.5,0,-63.5,32,66,0,-66,-32,63.5]},
            {"path":[1028,430,32,0,0,45,-32,0,0,-45,32,45,0,-45,-32,45]},
            {"path":[1115,486,20,0,0,113,-20,-1,0,-113,20,113,0,-113,-20,113]},
            {"path":[1280,430,55,0,0,56,-55,0,0,-56,55,56,0,-56,-55,56]},
            {"path":[1422,465,47,0,0,40,-47,0,0,-40,47,40,0,-40,-47,40]},
            {"path":[1509,526,25,0,0,107,-25,-2,0,-107,25,107,0,-107,-25,107]},
            {"path":[1709,630,122,0,0,28,-122,-10,0,-18,122,28,0,-28,-122,18]},
            {"path":[1060,430,65,0,0,56,-10,0,0,112,-55,-5]},
            {"path":[0,0,2210,0,-100,682,-2110,-179]}
          ]
        }
      },
      "hallmark2": {
        "seats": [
          [[540,118],[1,2,19],[-60,60,180]],
          [[580,141],[3,17,18],[0,120,-120]],
          [[620,118],[4,5,16],[-60,60,180]],
          [[660,141],[6,10,15],[0,120,-120]],
          [[700,118],[7,8,9],[-60,60,180]],
          [[660,187],[11],[60]],
          [[700,210],[12,13,14],[0,120,-120]],
          [[780,118],[20,21,37],[-60,60,180]],
          [[820,141],[22,26,36],[0,120,-120]],
          [[860,118],[23,24,25],[-60,60,180]],
          [[820,187],[27,31,35],[-60,60,180]],
          [[860,210],[28,29,30],[0,120,-120]],
          [[780,210],[34,32,33],[0,120,-120]],
          [[940,118],[38,39,55],[-60,60,180]],
          [[980,141],[40,44,54],[0,120,-120]],
          [[1020,118],[41,42,43],[-60,60,180]],
          [[980,187],[45,49,53],[-60,60,180]],
          [[1020,210],[46,47,48],[0,120,-120]],
          [[940,210],[52,50,51],[0,120,-120]],
          [[1100,118],[56,57,73],[-60,60,180]],
          [[1140,141],[58,62,72],[0,120,-120]],
          [[1180,118],[59,60,61],[-60,60,180]],
          [[1140,187],[63,67,71],[-60,60,180]],
          [[1180,210],[64,65,66],[0,120,-120]],
          [[1100,210],[70,68,69],[0,120,-120]],
          [[700,277],[109,108,110],[-60,60,180]],
          [[660,300],[111],[120]],
          [[660,346],[112],[60]],
          [[700,369],[113,114,115],[0,120,-120]],
          [[780,277],[94,95],[-60,180]],
          [[820,300],[93,106,96],[0,120,-120]],
          [[860,277],[92,91,107],[-60,60,180]],
          [[820,346],[105,101,97],[-60,60,180]],
          [[860,369],[104,103,102],[0,120,-120]],
          [[780,369],[98,100,99],[0,120,-120]],
          [[1118,277],[77,76,78],[-60,60,180]],
          [[1158,300],[75,89,79],[0,120,-120]],
          [[1198,277],[74,90],[-60,180]],
          [[1158,346],[80,88,84],[-60,60,180]],
          [[1198,369],[87,86,85],[0,120,-120]],
          [[1118,369],[81,83,82],[0,120,-120]],
          [[700,436],[117,116,118],[-60,60,180]],
          [[660,460],[119],[120]],
          [[660,506],[120],[60]],
          [[700,529],[121,122,125],[0,120,-120]],
          [[700,575],[123,124],[60,-60]],
          [[820,436],[128,132,127],[-60,60,180]],
          [[860,460],[129,130,131],[0,120,-120]],
          [[780,460],[126,133],[0,-120]],
          [[780,529],[134,135,150],[-60,60,180]],
          [[820,552],[136,140,149],[0,120,-120]],
          [[860,529],[137,138,139],[-60,60,180]],
          [[820,598],[148,141,145],[-60,60,180]],
          [[860,621],[142,143,144],[0,120,-120]],
          [[780,621],[147,146],[0,120]],
          [[940,529],[151,152,171],[-60,60,180]],
          [[980,552],[153,163,170],[0,120,-120]],
          [[1020,529],[154,155,162],[-60,60,180]],
          [[980,598],[164,165,169],[-60,60,180]],
          [[940,621],[168,166,167],[0,120,-120]],
          [[1060,552],[156,157,161],[0,120,-120]],
          [[1060,598],[158,159,160],[-60,60,180]],
          [[1158,436],[173,174,177],[-60,60,180]],
          [[1198,460],[175,176],[0,-120]],
          [[1118,460],[172,178,179],[0,120,-120]],
          [[1143,520],[180,185,186],[0,90,180], "fsh"],
          [[1203,520],[182,183,184,181],[0,90,180,-90], "fsh"]
        ],
        "pillars": [
          [563,61],[789,61],[1015,61],[1242,61],
          [563,256],[789,256],[1015,256],[1242,256],[332,256],[111,256],
          [563,462],[789,462],[1015,462],[1242,462],[332,462],[111,462],
          [789,657],[1015,657],[1242,657],[332,657]
        ],
        "rooms": {
          "list": [
            {"type":"meeting","path": [1035,255,-37,0,0,71,75,0,0,-37],"curve": [0,-20,-17,-33,-38,-34],"code": "Chhau","name": "Chhau","capacity":4},
            {"type":"meeting","path": [923,289,0,103,75,0,0,-137,-37,0],"curve": [-20,0,-37,13,-38,34],"code": "Kathak","name": "Kathak","capacity":8},
            {"type":"meeting","path": [1035,482,-37,0,0,-156,75,0,0,114],"curve": [0,20,-17,41,-38,42],"code": "Odissi","name": "Odissi","capacity":8},
            {"type":"meeting","path": [923,437,0,-45,75,0,0,90,-37,0],"curve": [-20,0,-37,-13,-38,-45],"code": "Mohini","name": "Mohini","capacity":4},
            {"type":"meeting","path": [597,205,-37,0,0,77,75,0,0,-38],"curve": [0,-20,-17,-38,-38,-39],"code": "Kuchipudi","name": "Kuchipudi","capacity":4},
            {"type":"meeting","path": [560,282,75,0,0,137,-75,0],"code": "Manipuri","name": "Manipuri","capacity":8},
            {"type":"meeting","path": [597,563,-37,0,0,-67,75,0,0,33],"curve": [0,20,-17,33,-38,34],"code": "Bharatanatyam","name": "Bharatanatyam","capacity":4},
            {"type":"meeting","path": [343,205,217,0,0,190,-217,0],"code": "Vikramshila","name": "Vikramshila"},
            {"type":"meeting","path": [343,395,217,0,0,168,-217,0],"code": "Sharada","name": "Sharada"},
            {"type":"meeting","path": [5,257,220,0,0,203,-220,0],"code": "NOC","name": "NOC Room"},
            {"path": [5,460,220,0,0,168,-220,0],"code": "tr","name": "Training Room","capacity":30},
            {"path": [485,61,0,144,-142,0,0,-67,73,0,0,-77],"code": "Pantry","name": "Pantry"},
            {"path": [262,168,0,-163,81,0,0,163],"code": "Ladiestoilet","name": "Ladies Toilet"},
            {"path": [140,168,0,-163,100,0,0,120,-30,0,0,43],"code": "Gentstoilet","name": "Gents Toilet"},
            {"path": [50,138,0,119,90,0,0,-119],"code": "Breakoutarea","name": "Breakout Area"},
            {"path": [5,5,0,133,135,0,0,-133],"code": "Breakoutarea","name": "Breakout Area"},
            {"path": [225,374,0,86,80,-43],"code": "Amphi","name": "Amphi "},
            {"path": [755,624,20,0,0,20,-20,0],"type": "printer"}
          ],
          "maponly": [
            {"path": [140,168,0,89,70,0,0,-89],"code": "electricalroom","name": "electricalroom"},
            {"path": [416,138,0,-133,-73,0,0,133],"code": "staircase","name": "staircase"},
            {"path": [1132,550,130,0,0,127,-130,0],"code": " ","name": " "},
            {"path": [1170,598,60,0,0,45,-60,0],"code": "AHU","name": "AHU"},
            {"path": [560,419,75,0,0,77,-75,0],"code": "IDF","name": "IDF"},
            {"path": [563,61,699,0,0,616,-1257,0,0,-672,411,0,0,56]}
          ]
        },
        "people": {
          "86": "Oonikrishnan PS ",
          "69": "Ashish Gupta",
          "66": "Somedip Karmakar",
          "67": "Sourit Manna",
          "68": "Omker Mahalanobish",
          "74": "Souraj Mishra",
          "75": "Amlan Jyoti Das",
          "76": "Arunita Das",
          "77": "Subhasish Misra",
          "78": "Vignesh S",
          "79": "Velu S Gautam",
          "80": "Chinthala Pradyumna Reddy",
          "81": "Narayana Rao Venkata Kandula",
          "82": "Shreyas Sathayamangalam",
          "83": "Raghu - PM",
          "84": "Gururaj M V",
          "85": "Ashwini Chandrashekharaiah",
          "87": "Riyanka Bhowal",
          "88": "Shilka Roy",
          "89": "Sumanth S Prabhu",
          "90": "Savio Francis Fernandes",
          "175": "Preyas Saxena",
          "174": "Paridhi Kabra",
          "173": "Gayatri Pal",
          "172": "Sparsh Goel",
          "179": "Shruti Diwakar",
          "178": "Vishal Dwivedi",
          "177": "Prateek Mishra",
          "176": "Nitin Kapoor",
          "181": "Divya Devarapalli",
          "182": "Akansha Sharma",
          "110": "Komatireddy Sridhar Reddy",
          "111": "Lovejeet Singh",
          "112": "Bandarupalli Suraj Ananya",
          "113": "Rajesh Gowda",
          "114": "Rahul Rout",
          "98": "Mallikharjuna Mv",
          "108": "Rohita Maddipati",
          "94": "Arvind Kejriwal",
          "95": "Nikhil Mohan",
          "96": "Antara Chatterjee",
          "97": "Mani Kanteswara Rao Garlapati",
          "105": "Deepa Radhakrishnan",
          "106": "Bharadwaj Aldur Siddegowda",
          "109": "Dimple Ashok Sadhwani",
          "107": "Jaahnnavi R",
          "8": "Shreyan Ghosh",
          "36": "Kedarnath V Reddy",
          "37": "Manohar Maddineni",
          "20": "Abhinav Ranjan",
          "21": "Rohit Sarewar",
          "22": "Pralabh Kumar",
          "25": "Vivek Kannan",
          "3": "Nimish Sharma",
          "4": "Vishal Lohia",
          "5": "Saurabh Mishra",
          "6": "Kumaresan Muthukumarasamy",
          "2": "Jagadish Kasi",
          "12": "Sachin Sharma",
          "11": "Maria Alphonsa Thomas",
          "10": "Sudipto Pal",
          "13": "Vivekananda Santhamurthy",
          "15": "Nagineni Raveendranaidu Kusuma",
          "17": "Achal Agarwal",
          "18": "Sona V Samad",
          "19": "Paulson Vincent",
          "14": "Vinay Venkateswaran",
          "26": "Harshavardhan Yeruva",
          "27": "Abhinaya Ananthakrishnan",
          "28": "Akash Verma",
          "47": "Pravat Ranjan",
          "48": "Ojaswini Chhabra",
          "49": "Rajesh Shreedhar Bhat",
          "50": "Aditi Ramanathan",
          "51": "Gopalakrishnan Anantharamakrishnan",
          "52": "Nanda Kishore Reddy",
          "53": "Abhishek R",
          "54": "Saravanan I",
          "55": "Venugopal Pikkala",
          "38": "Aditi Gupta",
          "39": "Suraj Shetty",
          "40": "Kushal M K",
          "41": "Soorisetty Gnana Sai Venkatesh",
          "24": "Kiran Kumar M",
          "42": "Saurabh Tyagi",
          "43": "Karandeep Singh",
          "44": "Harish Chandra Pranami",
          "45": "Anupam Kundu",
          "46": "Ramu Malur S R",
          "147": "Abhishek Mungoli",
          "146": "Sakthivel Elango",
          "145": "Soumya Pattar",
          "144": "Aloka S",
          "143": "Abhishek Sengupta",
          "142": "Esha Swaroop",
          "141": "Avinash M Jade",
          "140": "Meduri S N V Sai Yaswanth",
          "139": "Mohit Batham",
          "154":	"PM Contractor - Amrutha",
          "153": "Ashish Prabahakar",
          "152": "Gopi Krishna Pandey",
          "151": "Nitin Gupta",
          "171": "Rakesh Sukumar",
          "170": "Harshitha Sampangi",
          "169": "Shilpy Dua",
          "168": "Mahesh Devendra",
          "167": "Mohamed Asif Farook",
          "166": "Anubhav Tiwary",
          "165": "Namrata Rawat",
          "164": "Juhi Sharma",
          "163": "Hari Narayanan P",
          "162": "Ankur Verma",
          "161": "Vivek Gogineni",
          "158": "Janet Mascarenhas",
          "159": "Madhur Sarin",
          "30": "Sameer Bipin Shah",
          "31": "Sadaf Riyaz Sayyad",
          "32": "Nikesh Kumar Srivastava",
          "33": "Omkar Ravindra Shetty",
          "92": "Tejaswini G",
          "34": "Sanket Jagannath Mali",
          "29": "Sunit Pahwa ",
          "99": "Amit Ghosh",
          "148": "Pushkar Pushp",
          "149": "Rahul Agarwal",
          "150": "Girish Thiruvenkadam",
          "126": "Maddila Rishinda Kumar",
          "127": "Manya Malik",
          "128": "Mainak Mitra",
          "129": "Gopinath Sivasamy",
          "130": "Smaranya Dey",
          "131": "Hasil Sharma",
          "132": "Naveen Kumar Kaveti",
          "117": "Brijesh Kumar Singhal",
          "116": "Praveen Kumar Gajulapalli",
          "133": "Issac Mathew",
          "118": "Radhika Parik",
          "119": "Viraj Chimanlal Patel",
          "120": "Karishma Singh",
          "121": "Chandan Kumar",
          "122": "Suprit Saha",
          "123": "Manish Kumar Barnwal",
          "124": "Anindya Sankar Dey",
          "125": "Sujoy Saha",
          "100": "Rohit Bhutani",
          "101": "Niranjan Krishnadevaraya Kulkarni",
          "102": "Eshan Jain",
          "138": "Mohit Mehrotra",
          "137": "Reetika Choudhary",
          "136": "Ravi Kumar Gupta",
          "134": "Syed Mudassir ",
          "135": "N Kiran Kumar Reddy ",
          "91": "Prasanna Deshpande",
          "35": "Bhushan Bhimrao Sonawane",
          "157": "Nanda Kishore Rajanala ",
          "186": "Nitin Sareen",
          "7": "Chahak Gupta",
          "16": "Antriksh Shah",
          "9": "Ajay Sakarwal",
          "155": "Sunil Mathew",
          "185": "Sarika Gupta",
          "156": "Prashanth Shivaram",
          "56": "Ajay Sharma",
          "65": "Anish Mariyamparampil",
          "60": "Bagavathkumar Subramaniam",
          "64": "Bharat Lal",
          "70": "Girish Pillai",
          "57": "Hema Rajesh",
          "59": "Jayachandra Reddy",
          "58": "Narasimha Rao",
          "63": "Pravin Gadakh",
          "71": "Ravishankar Suribabu",
          "62": "Rishabh Bhardwaj",
          "73": "Sachin Parmar",
          "72": "Satya Narayan",
          "61": "Shally Sangal",
          "180": "Praveen Jana",
          "183": "Raghava Reddy",
          "184": "Himanshu Mittal"
        }
      },
      "hallmark1": {
        "seats":[
          [[286,109],[1,4,3],[60,180,-60]],
          [[323,129],[5],[-120]],
          [[323,170],[6],[-60]],
          [[288,190],[7,2,14],[0,120,-120]],
          [[252,170],[8,13,9],[60,180,-60]],
          [[216,190],[10,12,11],[0,120,-120]],

          [[165,249],[19,18],[180,-60]],
          [[201,269],[17,33,20],[0,120,-120]],
          [[237,249],[15,34,16],[60,180,-60]],
          [[201,310],[32,28,21],[60,180,-60]],
          [[237,330],[31,30,29],[0,120,-120]],
          [[165,330],[22,27,26],[0,120,-120]],
          [[129,310],[23,25,24],[60,180,-60]],

          [[129,390],[39,41,40],[60,180,-60]],
          [[165,410],[38,42],[0,-120]],
          [[201,390],[36,43,37],[60,180,-60]],
          [[237,410],[35,45,44],[0,120,-120]],

          [[215,470],[47,54,46],[60,180,-60]],
          [[251,490],[48,56,55],[0,120,-120]],
          [[287,470],[50,57,49],[60,180,-60]],
          [[323,490],[51,66,58],[0,120,-120]],
          [[359,470],[53,67,52],[60,180,-60]],
          [[323,532],[65,63,59],[60,180,-60]],
          [[359,552],[64],[0]],
          [[287,552],[60,62,61],[0,120,-120]],

          [[427,470],[80,82,81],[60,180,-60]],
          [[463,490],[79,75,83],[0,120,-120]],
          [[499,470],[77,76,78],[60,180,-60]],
          [[463,532],[74,70,84],[60,180,-60]],
          [[499,552],[73,72,71],[0,120,-120]],
          [[427,552],[85,69,68],[0,120,-120]],

          [[567,470],[124,126,125],[60,180,-60]],
          [[603,490],[123,133,127],[0,120,-120]],
          [[639,470],[121,134,122],[60,180,-60]],
          [[603,532],[132,130,128],[60,180,-60]],
          [[639,552],[131],[-120]],
          [[567,552],[129],[0]],

          [[707,470],[148,146,147],[60,180,-60]],
          [[743,490],[149,136,145],[0,120,-120]],
          [[779,470],[151,135,150],[60,180,-60]],
          [[743,532],[137,140,144],[60,180,-60]],
          [[779,552],[138,139],[0,-120]],
          [[707,552],[143,141,142],[0,120,-120]],

          [[847,470],[199,215,198],[60,180,-60]],
          [[883,490],[200,204,214],[0,120,-120]],
          [[919,470],[202,203,201],[60,180,-60]],
          [[883,532],[205,209,213],[60,180,-60]],
          [[919,552],[206,207,208],[0,120,-120]],
          [[847,552],[212,210,211],[0,120,-120]],

          [[987,552],[232,216],[0,120]],
          [[1023,532],[230,217,231],[60,180,-60]],
          [[1059,552],[229,219,218],[0,120,-120]],
          [[1095,532],[227,220,228],[60,180,-60]],
          [[1131,552],[226,222,221],[0,120,-120]],
          [[1167,532],[224,223,225],[60,180,-60]],

          [[1229,532],[303,305,304],[60,180,-60]],
          [[1265,552],[302,307,306],[0,120,-120]],
          [[1301,532],[300,308,301],[60,180,-60]],
          [[1337,552],[299,310,309],[0,120,-120]],
          [[1373,532],[297,311,296],[60,180,-60]],

          [[1225,451],[288,290,289],[60,180,-60]],
          [[1261,471],[287,292,291],[0,120,-120]],
          [[1297,451],[285,293,286],[60,180,-60]],
          [[1333,471],[284,295,294],[0,120,-120]],
          [[1369,451],[282,296,283],[60,180,-60]],

          [[1225,367],[273,275,274],[60,180,-60]],
          [[1261,387],[272,277,276],[0,120,-120]],
          [[1297,367],[270,278,271],[60,180,-60]],
          [[1333,387],[269,280,279],[0,120,-120]],
          [[1369,367],[267,281,268],[60,180,-60]],

          [[847,249],[175,176,174],[60,180,-60]],
          [[883,269],[177,181,173],[0,120,-120]],
          [[919,249],[179,180,178],[60,180,-60]],
          [[883,311],[182,186,172],[60,180,-60]],
          [[919,331],[183,184,185],[0,120,-120]],
          [[847,331],[171,187,188],[0,120,-120]],

          [[883,390],[191,196,190],[60,180,-60]],
          [[919,410],[192,193,194],[0,120,-120]],
          [[847,410],[189,196,197],[0,120,-120]],

          [[707,249],[167],[180]],
          [[743,269],[168,166],[120,-120]],
          [[743,311],[169,161,165],[60,180,-60]],
          [[779,331],[170,159,160],[0,120,-120]],
          [[707,331],[164,162,163],[0,120,-120]],

          [[743,390],[157,152,156],[60,180,-60]],
          [[779,410],[158],[0]],
          [[707,410],[155,153,154],[0,120,-120]],

          [[567,249],[104],[180]],
          [[603,269],[106,103],[120,-120]],
          [[639,249],[105],[180]],
          [[603,311],[107,111,102],[60,180,-60]],
          [[639,331],[108,109,110],[0,120,-120]],
          [[567,331],[101,112,113],[0,120,-120]],

          [[603,390],[116,120,115],[60,180,-60]],
          [[639,410],[117,118,119],[0,120,-120]],
          [[567,410],[114],[0]],

          [[463,269],[99,96],[120,-120]],
          [[499,249],[100],[180]],
          [[463,311],[98,94,95],[60,180,-60]],
          [[499,331],[97,92,93],[0,120,-120]],

          [[463,390],[90,88,89],[60,180,-60]],
          [[499,410],[91,86,87],[0,120,-120]],

          [[1037,244],[240,241],[120,-120]],
          [[1037,286],[239,235,242],[60,180,-60]],
          [[1073,306],[238,237,236],[0,120,-120]],
          [[1001,306],[243,234,233],[0,120,-120]],

          [[1188,244],[253],[120]],
          [[1224,224],[254],[180]],
          [[1188,286],[252,248,244],[60,180,-60]],
          [[1224,306],[251,250,249],[0,120,-120]],
          [[1152,306],[245,247,246],[0,120,-120]],

          [[1297,224],[255],[180]],
          [[1333,244],[266,256],[120,-120]],
          [[1333,286],[265,261,257],[60,180,-60]],
          [[1369,306],[264,263,262],[0,120,-120]],
          [[1297,306],[258,260,259],[0,120,-120]],

          [[1534,98],[321],[90],"rect"],
          [[1534,155],[320,317],[0,90],"rect"],
          [[1534,212],[316],[0],"rect"],

          [[1606,98],[329,323],[90,180],"rect"],
          [[1606,155],[328,325,319,322],[0,90,180,-90],"rect"],
          [[1606,212],[324,318],[0,-90],"rect"],

          [[1678,98],[337,331],[90,180],"rect"],
          [[1678,155],[336,333,327,330],[0,90,180,-90],"rect"],
          [[1678,212],[332,326],[0,-90],"rect"],

          [[1750,98],[345,339],[90,180],"rect"],
          [[1750,155],[344,341,335,338],[0,90,180,-90],"rect"],
          [[1750,212],[340,334],[0,-90],"rect"],

          [[1822,98],[347],[180],"rect"],
          [[1822,155],[343,346],[180,-90],"rect"],
          [[1822,212],[342],[-90],"rect"],

          [[1480,329],[314],[90],"rect"],
          [[1536,329],[315],[180],"rect"],
          [[1480,399],[312],[0],"rect"],
          [[1536,399],[313],[-90],"rect"]
        ],
        "pillars": [
          [1159,0],
          [368,60],[568,60],[765,60],[1359,60],[1556,60],[1756,60],
          [170,234],[368,234],[568,234],[765,234],[963,234],[1159,234],[1359,234],[1556,234],[1756,234],[1955,234],
          [170,416],[368,416],[568,416],[765,416],[963,416],[1159,416],[1359,416],[1556,416],[1756,416],[1955,416],
          [368,590],[568,590],[765,590],[963,590],[1159,590],[1359,590],[1556,590]
        ],
        "rooms": {
          "list": [
            {"type":"meeting","code":"Sanchi","path":[281,234,68,0,0,62,-68,0],"projector":true,"capacity":4},
            {"type":"meeting","code":"sanauli","path":[349,234,68,0,0,62,-68,0],"projector":true,"capacity":4},
            {"type":"meeting","code":"Siswal","path":[281,296,68,0,0,62,-68,0],"projector":true,"capacity":4},
            {"type":"meeting","code":"Wangath","path":[349,296,68,0,0,136,-68,0],"projector":true,"capacity":12},
            {"type":"meeting","code":"Manda","path":[963,353,63,0,0,68,-63,0],"projector":true,"capacity":4},
            {"type":"meeting","code":"MadanKamdev","name":"Madan Kamdev","path":[1026,353,82,0,0,68,-82,0],"projector":true,"capacity":6},
            {"type":"meeting","code":"Kunal","path":[1108,353,59,0,0,68,-59,0],"projector":true,"capacity":4},
            {"type":"meeting","code":"Pilak","path":[1026,421,82,0,0,68,-82,0],"projector":true,"capacity":6},
            {"type":"meeting","code":"Rakhigarhi","path":[1108,421,59,0,0,68,-59,0],"projector":true,"capacity":4},
            {"type":"meeting","code":"Sudi","path":[281,358,68,0,0,74,-68,0],"projector":true,"capacity":4},
            {"type":"meeting","code":"Kalibangan","path":[1317,110,55,0,0,66,-55,0],"projector":true,"capacity":4},
            {"type":"meeting","code":"KotlaNihang","name":"Kotla Nihang","path":[1372,110,56,0,0,66,-56,0],"projector":true,"capacity":4},
            {"type":"meeting","code":"Guge","path":[1428,95,82,0,0,100,-82,0],"projector":true,"capacity":8},
            {"type":"meeting","code":"EdakkalCaves","name":"Edakkal Caves","path":[1407,0,103,0,0,96,-103,0],"projector":true,"capacity":6},
            {"type":"meeting","code":"Dholavira","path":[1602,0,76,0,0,76,-76,0],"projector":true,"capacity":6},
            {"type":"meeting","code":"BetDwaraka","name":"Bet Dwaraka","path":[1678,0,55,0,0,76,-55,0],"projector":true,"capacity":4},
            {"type":"meeting","code":"Karnasubarna","path":[1428,218,82,0,0,67,-82,0],"projector":true,"capacity":6},
            {"type":"meeting","code":"Alamgirpur","path":[1567,429,140,0,0,78,-140,0],"projector":true,"capacity":12},
            {"type":"meeting","code":"Arikamedu","path":[1542,507,79,0,0,58,-79,0],"projector":true,"capacity":4},
            {"type":"meeting","code":"Asurgarh","path":[1621,507,86,0,0,58,-86,0],"projector":true,"capacity":6},
            {"type":"meeting","code":"Kumharar","path":[1510,235,56,0,0,66,-56,0],"projector":true,"capacity":4},
            {"type":"meeting","code":"Jorwe","path":[1566,235,56,0,0,66,-56,0],"projector":true,"capacity":4},
            {"type":"meeting","code":"Bhimbetka","path":[1622,235,56,0,0,66,-56,0],"projector":true,"capacity":4},
            {"type":"meeting","code":"noc","name":"NOC","path":[1853,235,195,0,0,180,-195,0],"projector":true},
            {"type":"meeting","code":"BelumCaves","name":"Belum Caves","path":[1755,250,98,0,0,165,-98,0],"projector":true},
            {"type":"meeting","code":"Anegundi","path":[1853,415,195,0,0,152,-195,0],"projector":true,"capacity":30},
            {"type":"printer","path":[387,590,17,0,0,17,-17,0]},
            {"type":"printer","path":[784,590,17,0,0,17,-17,0]},
            {"type":"printer","path":[1178,590,17,0,0,17,-17,0]},
            {"code":"library","name":"Library","path":[963,421,63,0,0,68,-63,0]},
            {"code":"gentstoilet","name":"Gents toilet","path":[980,0,72,0,0,198,-72,0]},
            {"code":"ladiestoilet","name":"Ladies toilet","path":[1070,0,100,0,0,144,-100,0]},
            {"code":"recreation","name":"Recreation","path":[368,60,115,0,0,146,-115,0]},
            {"code":"breakout","name":"Breakout","path":[1880,122,84,0,0,113,-84,0]},
            {"code":"femaledorm","name":"Female dorm","path":[1513,0,89,0,0,76,-89,0]},
            {"code":"maledorm","name":"Male dorm","path":[1487,430,80,0,0,77,-80,0]},
            {"code":"mail","name":"Mail","path":[1487,507,55,0,0,58,-55,0]},
            {"code":"reception","name":"Reception","path":[1755,415,98,0,0,152,-98,0]},
            {"code":"pantry","name":"Pantry","path":[483,60,180,0,0,118,-40,0,0,28,-140,0]}
          ],
          "maponly": [
            {"code":"exetoilet","name":"Exe toilet","path":[1112,144,58,0,0,54,-58,0]},
            {"code":"itstore","name":"IT Store","path":[1428,451,59,0,0,114,-59,0]},
            {"code":"store","name":"Store","path":[1733,0,116,0,0,76,-116,0]},
            {"code":"IDF","path":[663,60,50,0,0,118,-50,0]},
            {"code":"ELE","path":[828,60,85,0,0,68,-85,0]},
            {"code":"Store","path":[855,128,57,0,0,50,-57,0]},
            {"code":"BMS","path":[1170,120,80,0,0,56,-80,0]},
            {"code":"UPS","path":[1287,0,120,0,0,110,-120,0]},
            {"code":"Services","path":[1428,285,82,0,0,41,30,0,0,104,-112,0]},
            {"path":[1510,301,197,0,0,128,-167,0,0,-103,-30,0]},
            {"path":[0,333,278,-273,615,0,0,-60,1155,0,0,606,-1769,0]},
            {"path":[713,60,115,0,0,118,-115,0]},
            {"path":[1170,0,117,0,0,120,-117,0]},
            {"path":[1849,0,115,0,0,122,-115,0]}
          ]
        }
      },
      "touchstone3": {
        "seats": [
          [[249,630],[1],[90]],
          [[249,742],[2,3],[0,90]],
          [[249,854],[4],[0]],

          [[369,462],[12,11],[90,180]],
          [[369,518],[13,10],[90,180]],
          [[369,630],[14,15,8,9],[0,90,180,-90]],
          [[369,742],[16,17,6,7],[0,90,180,-90]],
          [[369,854],[18,5],[0,-90]],

          [[490,462],[25],[180]],
          [[490,518],[24],[180]],
          [[490,630],[22,23],[180,-90]],
          [[490,742],[20,21],[180,-90]],
          [[490,854],[19],[-90]],

          [[565,462],[36,26],[90,180]],
          [[565,518],[35],[90]],
          [[565,608],[34,27],[90,180]],
          [[565,720],[33,32,29,28],[0,90,180,-90]],
          [[565,832],[31,30],[0,-90]],

          [[683,462],[50,37],[90,180]],
          [[683,518],[49,38],[90,180]],
          [[683,630],[48,47,40,39],[0,90,180,-90]],
          [[683,742],[46,45,42,41],[0,90,180,-90]],
          [[683,854],[44,43],[0,-90]],

          [[805,462],[51],[180]],
          [[805,518],[52],[180]],
          [[805,630],[54,53],[180,-90]],
          [[805,742],[56,55],[180,-90]],
          [[805,854],[57],[-90]],

          [[879,608],[62,61],[90,180]],
          [[879,720],[63,64,59,60],[0,90,180,-90]],
          [[879,832],[65,58],[0,-90]],

          [[1000,462],[73,72],[90,180]],
          [[1000,518],[74,71],[90,180]],
          [[1000,630],[75,76,69,70],[0,90,180,-90]],
          [[1000,742],[77,78,67,68],[0,90,180,-90]],
          [[1000,854],[79,66],[0,-90]],

          [[1120,462],[86],[180]],
          [[1120,518],[85],[180]],
          [[1120,630],[83,84],[180,-90]],
          [[1120,742],[81,82],[180,-90]],
          [[1120,854],[80],[-90]],

          [[1195,608],[94,87],[90,180]],
          [[1195,720],[93,92,89,88],[0,90,180,-90]],
          [[1195,832],[91,90],[0,-90]],

          [[1316,462],[108,95],[90,180]],
          [[1316,518],[107,96],[90,180]],
          [[1316,630],[106,105,98,97],[0,90,180,-90]],
          [[1316,742],[104,103,100,99],[0,90,180,-90]],
          [[1316,854],[102,101],[0,-90]],

          [[1436,462],[122,109],[90,180]],
          [[1436,518],[121,110],[90,180]],
          [[1436,630],[120,119,112,111],[0,90,180,-90]],
          [[1436,742],[118,117,114,113],[0,90,180,-90]],
          [[1436,854],[116,115],[0,-90]],

          [[1568,608],[123],[180]],
          [[1568,720],[125,124],[180,-90]],
          [[1568,832],[126],[-90]],

          [[1855,472],[127],[90]],
          [[1855,528],[128],[90]],
          [[1855,640],[129,130],[0,90]],
          [[1855,752],[131,132],[0,90]],
          [[1855,864],[133],[0]],

          [[1976,472],[141,140],[90,180]],
          [[1976,528],[142,139],[90,180]],
          [[1976,640],[143,137,138],[90,180,-90]],
          [[1976,752],[144,145,135,136],[0,90,180,-90]],
          [[1976,864],[134],[-90]],

          [[2099,472],[153,152],[90,180]],
          [[2099,528],[154,151],[90,180]],
          [[2099,640],[155,156,149,150],[0,90,180,-90]],
          [[2099,752],[157,158,147,148],[0,90,180,-90]],
          [[2099,864],[159,146],[0,-90]],

          [[2219,472],[167,166],[90,180]],
          [[2219,528],[168,165],[90,180]],
          [[2219,640],[169,170,163,164],[0,90,180,-90]],
          [[2219,752],[171,172,161,162],[0,90,180,-90]],
          [[2219,864],[173,160],[0,-90]],

          [[2340,640],[177,176],[90,180]],
          [[2340,752],[178,179,174,175],[0,90,180,-90]],

          [[2460,472],[187,186],[90,180]],
          [[2460,528],[188,185],[90,180]],
          [[2460,640],[189,190,183,184],[0,90,180,-90]],
          [[2460,752],[191,192,181,182],[0,90,180,-90]],
          [[2460,864],[193,180],[0,-90]],

          [[2582,472],[199,198],[90,180]],
          [[2582,528],[200,197],[90,180]],
          [[2582,640],[201,196],[90,180]],
          [[2582,752],[202,203,194,195],[0,90,180,-90]],

          [[2702,472],[211,210],[90,180]],
          [[2702,528],[212,209],[90,180]],
          [[2702,640],[213,214,207,208],[0,90,180,-90]],
          [[2702,752],[215,216,205,206],[0,90,180,-90]],
          [[2702,864],[217,204],[0,-90]],

          [[2822,472],[225,224],[90,180]],
          [[2822,528],[226,223],[90,180]],
          [[2822,640],[227,228,221,222],[0,90,180,-90]],
          [[2822,752],[229,230,219,220],[0,90,180,-90]],
          [[2822,864],[231,218],[0,-90]],

          [[2942,640],[235,234],[90,180]],
          [[2942,752],[236,237,232,233],[0,90,180,-90]],
          [[2942,864],[238],[0]],

          [[3062,472],[246,245],[90,180]],
          [[3062,528],[247,244],[90,180]],
          [[3062,640],[248,249,242,243],[0,90,180,-90]],
          [[3062,752],[250,251,240,241],[0,90,180,-90]],
          [[3062,864],[252,239],[0,-90]],

          [[3182,472],[259],[180]],
          [[3182,528],[258],[180]],
          [[3182,640],[256,257],[180,-90]],
          [[3182,752],[254,255],[180,-90]],
          [[3182,864],[253],[-90]],

          [[3262,472],[265,264],[90,180]],
          [[3262,528],[266,263],[90,180]],
          [[3262,640],[267,268,262],[0,90,180]],
          [[3262,752],[269,270,260,261],[0,90,180,-90]],
          [[3262,864],[271],[0]],

          [[3382,472],[279,278],[90,180]],
          [[3382,528],[280,277],[90,180]],
          [[3382,640],[281,282,275,276],[0,90,180,-90]],
          [[3382,752],[283,284,273,274],[0,90,180,-90]],
          [[3382,864],[285,272],[0,-90]],

          [[3502,472],[292],[180]],
          [[3502,528],[291],[180]],
          [[3502,640],[289,290],[180,-90]],
          [[3502,752],[287,288],[180,-90]],
          [[3502,864],[286],[-90]],

          [[3578,640],[298,293],[90,180]],
          [[3578,752],[297,296,295,294],[0,90,180,-90]],

          [[3698,472],[306,299],[90,180]],
          [[3698,528],[305,300],[90,180]],
          [[3698,640],[304,301],[0,-90]],
          [[3698,696],[303,302],[0,-90]],

          [[3818,472],[310],[180]],
          [[3818,528],[309],[180]],
          [[3818,640],[308],[-90]],
          [[3818,696],[307],[-90]],

          [[3802,202],[314],[180]],
          [[3802,314],[315,312,313],[90,180,-90]],
          [[3802,426],[316,311],[0,-90]],

          [[3922,202],[322],[90]],
          [[3922,314],[321,320,318],[0,90,180]],
          [[3922,426],[319,317],[0,-90]],

          [[4042,202],[330,326],[90,180]],
          [[4042,314],[329,328,324,325],[0,90,180,-90]],
          [[4042,426],[327,323],[0,-90]],

          [[4162,202],[331],[180]],
          [[4162,314],[333,332],[180,-90]],
          [[4162,426],[334],[-90]]
        ],
        "pillars": [
          [3552,0],[3878,0],[4203,0],
          [2313,269],[2571,269],[2898,269],[3225,269],[3552,269],[3878,269],[4203,269],
          [200,543],[527,543],[855,543],[1182,543],[1506,543],
          [1986,597],[2313,597],[2571,597],[2898,597],[3225,597],[3552,597],[3878,597],[4203,597],
          [200,834],[527,834],[855,834],[1182,834],[1506,834],
          [1986,845],[2313,845],[2571,845],[2898,845],[3225,845],[3552,845],[4203,845]
        ],
        "rooms": {
          "list": [
            {"type":"meeting","code":"RohitKaila","name":"Rohit Kaila touch base rm","path":[42,404,112,0,0,92,-112,0],"projector":true,"capacity":4},
            {"type":"meeting","code":"Bhagirathi","path":[42,496,112,0,0,128,-112,0],"capacity":6,"projector":true},
            {"type":"meeting","code":"Arkavati","path":[42,624,112,0,0,128,-112,0],"capacity":6,"projector":true},
            {"code":"Alaknanda","path":[42,752,112,0,0,128,-112,0],"projector":true},
            {"code":"Mahanadi","path":[2676,334,88,0,0,92,-88,0],"projector":true},
            {"code":"Malaprabha","path":[2764,334,88,0,0,92,-88,0],"projector":true},
            {"code":"Tapti","path":[3968,566,102,0,0,98,-102,0]},
            {"code":"Huddle","path":[1145,462,100,0,0,146,-100,0]},
            {"code":"Huddle","path":[3528,472,100,0,0,168,-100,0]},
            {"type":"meeting","code":"Ghataprabha","path":[1569,526,115,0,0,154,-115,0],"capacity":8,"projector":true},
            {"type":"meeting","code":"Hemavati","path":[1738,526,115,0,0,154,-115,0],"capacity":8,"projector":true},
            {"type":"meeting","code":"Godavari","path":[1569,682,142,0,0,184,-142,0],"capacity":12,"projector":true},
            {"type":"meeting","code":"Gomti","path":[1711,682,142,0,0,184,-142,0],"capacity":12,"projector":true},
            {"type":"meeting","code":"Cauvery","path":[1008,278,120,0,0,124,-120,0],"capacity":4,"projector":true},
            {"type":"meeting","code":"Ganga","path":[1463,341,109,0,0,84,-109,0],"capacity":4,"projector":true},
            {"type":"meeting","code":"Hooghly","path":[2106,305,106,0,0,121,-106,0],"capacity":6,"projector":true},
            {"type":"meeting","code":"Kabini","path":[2212,305,190,0,0,121,-190,0],"capacity":10,"projector":true},
            {"type":"meeting","code":"Kali","path":[2456,307,172,0,0,119,-172,0],"capacity":10,"projector":true},
            {"type":"meeting","code":"Krishna","path":[2676,231,157,0,0,103,-157,0],"capacity":6,"projector":true},
            {"type":"meeting","code":"Balu touch base rm","path":[2852,334,97,0,0,92,-97,0],"capacity":4,"projector":true},
            {"type":"meeting","code":"Narmada","path":[2994,137,266,0,0,291,-266,0],"capacity":28,"projector":true},
            {"type":"meeting","code":"Sabrmati","path":[3626,194,102,0,0,89,-102,0],"capacity":4,"projector":true},
            {"type":"meeting","code":"Netravati","path":[3626,283,102,0,0,141,-102,0],"capacity":6,"projector":true},
            {"type":"meeting","code":"Sarasvati","path":[3866,470,102,0,0,96,-102,0],"capacity":4,"projector":true},
            {"type":"meeting","code":"Sharavati","path":[3968,470,102,0,0,96,-102,0],"capacity":4,"projector":true},
            {"type":"meeting","code":"HROp","name":"HR Operations","path":[4070,470,102,0,0,96,-102,0],"capacity":4,"projector":true},
            {"type":"Printer","name":"Printer","path":[1992,338,81,0,0,87,-81,0]},
            {"type":"Printer","name":"Printer","path":[692,352,92,0,0,50,-92,0]},
            {"type":"Printer","path":[3840,730,20,0,0,20,-20,0]},
            {"code":"Pantry","path":[1018,107,236,0,0,170,-236,0]},
            {"code":"Pantry","path":[3626,0,342,0,0,194,-342,0]},
            {"code":"gentstoilet","name":"Gents Toilet","path":[1254,107,114,0,0,170,-114,0]},
            {"code":"gentstoilet","name":"Gents Toilet","path":[1990,14,129,0,0,239,-129,0]},
            {"code":"gentstoilet","name":"Gents Toilet","path":[4096,0,143,0,0,160,-143,0]},
            {"code":"ladiestoilet","name":"Ladies Toilet","path":[1408,107,133,0,0,184,-78,0,0,-54,-55,0]},
            {"code":"ladiestoilet","name":"Ladies Toilet","path":[2163,14,107,0,0,202,-63,0,0,-33,-46,0]},
            {"code":"ladiestoilet","name":"Ladies Toilet","path":[3971,0,125,0,0,160,-125,0]},
            {"code":"disabledtoilet","name":"Toilet for Disabled","path":[1254,278,83,0,0,60,-83,0]},
            {"code":"disabledtoilet","name":"Toilet for Disabled","path":[2156,183,51,0,0,71,-51,0]},
            {"code":"Reception","path":[1572,293,316,0,0,132,-316,0]},
            {"code":"Liftlobby","path":[1540,107,348,0,0,185,-348,0]},
            {"code":"Changeroom","name":"Change room","path":[3866,566,102,0,0,98,-102,0]},
            {"code":"mendorm","name":"Dormitory-He","path":[2456,168,98,0,0,139,-98,0]},
            {"code":"womendorm","name":"Dormitory-She","path":[2676,138,157,0,0,93,-157,0]},
            {"code":"Recreation","path":[4084,654,120,0,0,195,-120,0]},
            {"code":"Concierge","path":[1568,470,82,0,0,56,-82,0]}
          ],
          "maponly": [
            {"code":"Store","path":[2833,180,116,0,0,154,-116,0]},
            {"code":"Store","path":[3802,202,119,0,0,110,-119,0]},
            {"code":"itstore","name":"IT Store","path":[3431,303,155,0,0,124,-155,0]},
            {"code":"itstore","name":"IT Store","path":[2554,168,74,0,0,139,-74,0]},
            {"code":"BMS","path":[2270,166,132,0,0,138,-132,0]},
            {"code":"Stairs","path":[325,218,239,0,0,134,-239,0]},
            {"code":"Stairs","path":[1888,107,102,0,0,231,-102,0]},
            {"code":"Stairs","path":[2953,0,213,0,0,137,-213,0]},
            {"code":"Stairs","path":[3664,757,200,0,0,112,-200,0]},
            {"code":"Janitor","path":[1463,292,77,0,0,49,-77,0]},
            {"code":"AHU","path":[784,218,180,0,0,184,-180,0]},
            {"code":"AHU","path":[2270,0,187,0,0,166,-187,0]},
            {"code":"AHU","path":[3261,0,249,0,0,92,-249,0]},
            {"code":"AHU","path":[3864,705,198,0,0,164,-198,0]},
            {"code":"BMS","path":[3510,0,116,0,0,92,-116,0]},
            {"code":"Server","path":[3302,92,284,0,0,211,-284,0]},
            {"code":"HUB","path":[3302,303,128,0,0,124,-128,0]},
            {"code":"HUB","path":[1128,278,126,0,0,124,-126,0]},
            {"code":"HUB","path":[1888,369,104,0,0,56,-104,0]},
            {"code":"Mail","path":[1773,470,82,0,0,56,-82,0]},
            {"code":"Electrical","path":[1254,338,161,0,0,64,-161,0]},
            {"code":"UPS","path":[2457,0,149,0,0,166,-149,0]},
            {"code":"SLift","path":[2738,42,95,0,0,96,-95,0]},
            {"code":"SLift","path":[701,262,83,0,0,90,-83,0]},
            {"code":"Security","path":[2833,0,120,0,0,137,-120,0]},
            {"code":"Security","path":[581,218,120,0,0,134,-120,0]},
            {"code":"electrical","path":[2634,0,104,0,0,138,-104,0]},
            {"name":"Admin Store","path":[1992,253,81,0,0,85,-81,0]},
            {"path":[0,218,1018,0,0,-112,972,0,0,-92,280,0,0,-14,1969,0,0,886,-4239,0]}
          ]
        },
        "people": {
          "116":"Kedarnath V Reddy",
          "117":"Manohar Maddineni",
          "118":"Ajay Sakarwal (Customer)",
          "119":"Nimish Sharma",
          "120":"Kumaresan Muthukumarasamy",
          "121":"Chahak Gupta (Customer)",
          "122":"Pralabh Kumar",
          "123":"Vishal Lohia",
          "124":"Saurabh Mishra",
          "125":"Rohit Sarewar",
          "126":"Abhinav Ranjan",
          "127":"Achal Aggarwal",
          "128":"Sona V Samad",
          "129":"Antriskh Shah (Customer)",
          "130":"Vivekananda Santhamurthy",
          "131":"Sachin Sharma",
          "136":"Maria Alphonsa Thomas",
          "137":"Sudipto Pal",
          "138":"Paulson Vincent",
          "139":"Nagineni Raveendranaidu Kusuma",
          "140":"Sunil Mathai Mathew ",
          "141":"Vinay Venkateswaran",
          "142":"Soumya Pattar",
          "143":"Harish Kumar (Pricing)",
          "144":"Ashish Prabahakar",
          "145":"Mohamed Asif Farook",
          "146":"Juhi Sharma",
          "147":"Ashwini Chandrashekharaiah",
          "148":"Vivek Srivastava",
          "149":"Nitin Gupta",
          "150":"Sakthivel Elango",
          "151":"Gopi Krishna Pandey",
          "152":"Sarika Gupta",
          "153":"QA - Kavya",
          "156":"Akansha Sharma",
          "157":"Hari Narayanan P",
          "158":"Jaahnnavi Rajagopalan",
          "159":"Rakesh Sukumar",
          "160":"Avinash M Jade",
          "161":"Himanshu Mittal (Pricing)",
          "162":"Vivek Gogineni",
          "163":"Chinthala Pradyumna Reddy",
          "166":"QA - Naresh",
          "167":"Janet Mascarenhas",
          "168":"Anupam Kundu",
          "169":"Abhishek Mungoli",
          "170":"Aloka S",
          "171":"Prashanth Shivaram",
          "172":"Shilpy Dua",
          "173":"Shruti Diwakar",
          "174":"Biswajit Pal",
          "175":"Mohit Batham",
          "176":"Abhishek Sengupta",
          "177":"Mahesh .",
          "178":"Ankur Verma",
          "179":"Madhur Sarin",
          "180":"Sujoy Saha",
          "181":"Namrata Rawat",
          "182":"Vishal Dwivedi",
          "183":"Esha Swaroop",
          "184":"Meduri S N V Sai Yaswanth",
          "185":"Anubhav Tiwary",
          "186":"Riyanka Bhowal",
          "187":"Oonikrishnan PS ",
          "188":"Nithya Swaminathan",
          "189":"Velu S Gautam",
          "190":"V V B Praveen Kumar Jana",
          "191":"Raghu Gundurao Khatokar",
          "192":"Karandeep Singh",
          "193":"Harish Chandra Pranami",
          "194":"Saurabh Tyagi",
          "195":"Vignesh S",
          "196":"Gururaj M V",
          "197":"Raghava Reddy (Assortment)",
          "198":"Nitin Sareen",
          "199":"Ashish Gupta",
          "200":"Bodhisattwa Majumder (Assortment)",
          "201":"Omker Mahalanobish",
          "202":"Amlan Jyoti Das",
          "204":"Arunita Das",
          "206":"Souraj Mishra",
          "207":"Subhasish Misra",
          "208":"Sumanth S Prabhu",
          "209":"Gayatri Pal",
          "210":"Shreyas Sathayamangalam",
          "211":"Somedip Karmakar",
          "213":"Sparsh Goel",
          "214":"Rohita Maddipati",
          "215":"Ojaswini Chhabra",
          "216":"Mallikharjuna Maruthi Vallabhajosyula",
          "217":"Keshav Sehgal (Sourcing)",
          "218":"Antara Chatterjee",
          "219":"Mani Kanteswara Rao Garlapati",
          "220":"Bharadwaj Aldur Siddegowda",
          "221":"Deepa Radhakrishnan",
          "222":"Sourit Manna",
          "223":"Divya Devarapalli",
          "224":"Savio Francis Fernandes",
          "227":"Prasanna Deshpande",
          "228":"Arvind Kejriwal",
          "229":"Srinath Rajagopalan (Sourcing)",
          "230":"Rajesh Gowda",
          "231":"Bandarupalli Suraj Ananya",
          "232":"Lovejeet Singh",
          "233":"QA - Soma Mohanty",
          "234":"Dimple Ashok Sadhwani",
          "235":"Abhishek R",
          "235":"Jyoti Kumari",
          "236":"Rashmeet Kaur",
          "237":"Rahul Rout",
          "238":"Komatireddy Sridhar Reddy",
          "241":"Suraj Shetty",
          "242":"Aditi Gupta",
          "243":"Kiran Kumar M",
          "245":"Kushal M K",
          "246":"Omkar Ravindra Shetty",
          "247":"Suhas Khandiga",
          "248":"Nanda Kishore Reddy",
          "249":"Venugopal Pikkala",
          "250":"Saravanan I",
          "250":"Biswajeet Nayak",
          "251":"Pravat Ranjan Rana ",
          "252":"Kishodra ( New joinee) ",
          "253":"QA",
          "254":"Soorisetty Gnana Sai Venkatesh",
          "255":"Gopalakrishnan Anantharamakrishnan",
          "255":"Rajath RD ( Intern )",
          "257":"Aditi Ramanathan",
          "258":"Rajesh Shreedhar Bhat",
          "259":"Tejaswini G",
          "260":"Nitin Kapoor",
          "261":"Prateek Mishra",
          "262":"Paridhi Kabra",
          "263":"Sunit Pahwa ",
          "264":"Bhushan Bhimrao Sonawane",
          "266":"Nikesh Kumar Srivastava",
          "267":"Sadaf Riyaz Sayyad",
          "268":"Preyas Saxena",
          "269":"Shilka Roy",
          "270":"Akash Verma",
          "271":"Abhinaya Ananthakrishnan",
          "272":"Vivek Kannan",
          "273":"Harshavardhan Reddy Yeruva",
          "274":"Shreyan Ghosh",
          "276":"Sameer Bipin Shah",
          "277":"Sanket Jagannath Mali",
          "280":"Hasil Sharma",
          "281":"Radhika Parik",
          "282":"Mainak Mitra",
          "283":"Manya Malik",
          "284":"Manish Kumar Barnwal",
          "285":"Chandan Kumar",
          "286":"Smaranya Dey",
          "287":"Karishma Singh",
          "288":"Suprit Saha",
          "289":"Maddila Rishinda Kumar",
          "290":"Viraj Chimanlal Patel",
          "291":"Praveen Kumar Gajulapalli",
          "293":"Naveen Kumar Kaveti",
          "294":"Brijesh Kumar Singhal",
          "296":"N Kiran Kumar Reddy ",
          "298":"Eshan Jain",
          "299":"Harshitha Sampangi",
          "300":"Anindya Sankar Dey",
          "301":"Gopinath Sivasamy",
          "302":"Niranjan Krishnadevaraya Kulkarni",
          "304":"Pinaki Ranjan Brahma",
          "305":"Rohit Bhutani",
          "306":"Issac Mathew",
          "307":"Pushkar Pushp",
          "308":"Rahul Agarwal",
          "309":"Girish Thiruvenkadam",
          "310":"Syed Mudassir ",
          "313":"Akshay Jadiya (Supply Chain)",
          "314":"Anushree Joshi (Supply Chain)",
          "315":"Amit Ghosh",
          "316":"Reetika Choudhary",
          "311":"Ravi Kumar Gupta",
          "312":"Mohit Mehrotra"
        }
      }
    };
    const svg = document.getElementById('svgmap');
    const link = document.querySelectorAll('a[data-floor="' + lastseen + '"]');
    const header = document.getElementById('page-header');
    const {name, box} = link[0].dataset;
    link[0].classList.add('active');
    header.innerText = name;
    svg.setAttribute("viewBox", `0 0 ${box}`);
    app.loadFloor(lastseen);
  }
};
app.init();
