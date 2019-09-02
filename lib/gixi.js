import jsSHA from 'jssha';

class Color {
  constructor(strTotal, r,g,b,t = 1) {
    let str16 = Number(strTotal * 999).toString(16);
    // this.r = r || Math.floor(strHashColor * 200);
    // this.g = g || Math.floor(strHashColor * 200);
    // this.b = b || Math.floor(strHashColor * 200);
    this.r = parseInt(str16.substr(0,2), 16);
    this.g = parseInt(str16.substr(2,2), 16);
    this.b = parseInt(str16.substr(4,2), 16);
    this.t = t;
  }

  rgba() {
    return `rgba(${this.r},${this.g},${this.b},${this.t})`;
  }
}

/*
  @param {Number}  width of the image
  @param {Number}  height of the image

  Properties:
    fillStyle {css colour}  color of the generated image
*/

class GIXI {
  constructor(str = '', w = 60) {
    this.w = w;
    this.h = w;
    this.str = str;

    this.strHashObj = new jsSHA('SHA-512', 'TEXT');
    this.strHashObj.update(this.str);
    this.strHash = this.strHashObj.getHash('HEX');
    this.strTotal = 0;
    this.strHashRule = 0;

    let strArr = this.strHash.split('');
    strArr.forEach((item) => {
      this.strTotal = this.strTotal + item.charCodeAt();
    })
    this.PARTITIONS = 3;
    this.LESS_SEED = 6;

    this.BASE_SEED = 5;
    this.SEED_H = this.h / this.BASE_SEED;
    this.SEED_W = this.w / this.BASE_SEED;
  }

  getImage() {
    let element = document.createElement('canvas');
    let imageData = null;
    element.width = this.w;
    element.height = this.h;

    if (!element && !element.getContext) {
      throw new Error('Canvas does not supported');
    }

    this.drw = element.getContext('2d');
    this.drw.fillStyle = this.fillStyle || new Color(this.strTotal).rgba();
    this.map(this.grid());

    imageData = element.toDataURL();

    element = null;
    return imageData;
  }

  draw() {
    this.drw.fillRect.apply(this.drw,arguments);
  }

  map(grid) {
    for (let y = 0; y < grid.length; y++) {
      for (let x = 0; x < grid[y].length; x++) {

        if (grid[y][x] === true) {
          this.draw(this.SEED_H * y, this.SEED_W * x, this.SEED_W, this.SEED_H);
            if (y < (this.PARTITIONS - 1)) {
              this.draw(this.SEED_H * ((this.PARTITIONS + 1) - y), this.SEED_W * x, this.SEED_W, this.SEED_H);
            }
        }

      }
    }
  }

  to2(n) {
    if(n == 0) return '0';
    var res = '';  
    while(n != 0) {
        res = n % 2 + res
        n = parseInt(n / 2)
     }  
     return res;
  }

  grid() {
    let makeMap = () => {
        let map = [];
        this.strHashRule = this.to2(this.strTotal * 3).toString().substr(0, 15);
        let mapArr = this.strHashRule.split('');

        mapArr.forEach((item, index) => {
          if (!map[parseInt(index/5)]) {
            map[parseInt(index/5)] = [];
          }
          map[parseInt(index/5)][parseInt(index%5)] = !!Number(item)
        })
        // for (let y = 0; y < this.PARTITIONS; y++) {
        //   map[y] = [];
        //   for (let x = 0; x < this.BASE_SEED; x++ ) {
        //     map[y][x] = !!Math.floor(Math.random() * 2);
        //   }
        // }
        // console.error('1 map:', JSON.stringify(map));

        // map[this.PARTITIONS - 1] = map[this.PARTITIONS - 1]
          // .map( (i,c) => map[this.PARTITIONS - 2][c] === i ? false : !!Math.floor(Math.random() * 2));

        // console.error('2 map:', JSON.stringify(map));
        // map = [[false,true,true,true,false],[false,false,true,false,true],[true,false,false,true,true]];
      return {
        map : map,
        dots : () => {
          return map.map( i => i.reduce((p,c) => c ? p + c : p)).reduce((p,c) => c + p);
        },
        isFilledTop : () => {
          return map.map( i => i[0]).reduce( (p,c) => p || c ? true : false);
        },
        isFilledBottom : () => {
          return map.map( i => i[i.length - 1]).reduce( (p,c) => p || c ? true : false);
        }
      }
    }

    let result = makeMap();

    while(result.dots() < this.LESS_SEED || !result.isFilledTop() || !result.isFilledBottom()) {
      result = makeMap();
    }

    return result.map;
  }
}


export default GIXI;
