import { Component, OnInit } from "@angular/core";
import { map } from "rxjs/operators";

import { Map, View } from "ol";
import { Tile as TileLayer, Vector as VectorLayer } from "ol/layer";
import { XYZ, Vector as VectorSource } from "ol/source";
import { Style, Fill, Stroke, Circle } from "ol/style";
import { GeoJSON } from "ol/format";
import { click, singleClick } from "ol/events/condition";
import Select from "ol/interaction/Select";
import OSM, { ATTRIBUTION } from "ol/source/OSM";
import KML from "ol/format/KML";
import Stamen from "ol/source/Stamen";
import Cluster from "ol/source/Cluster";
import { Circle as CircleStyle, RegularShape, Text } from "ol/style";

// rayon 2*PI*r
const radius = 50;
const perimeter = 2 * Math.PI * radius;
const lineCap = "but";
const width = 8;

const repart: { nb: number; color: string }[] = [
  { nb: 6, color: "red" },
  { nb: 24, color: "green" },
  { nb: 5, color: "orange" },
  { nb: 12, color: "purple" }
];

function getDonutStyles(
  radius: number,
  width: number,
  repart: { nb: number; color: string }[]
) {
  const perimeter = 2 * Math.PI * radius;
  const total = repart.reduce((acc, curr) => acc + curr.nb, 0);
  const styles = [];

  repart
    .sort((r1, r2) => r2.nb - r1.nb)
    .reduce((acc, curr) => {
      styles.push(
        new Style({
          image: new Circle({
            radius,
            stroke: new Stroke({
              color: curr.color,
              width,
              lineDash: [
                0,
                acc === 0 ? 0 : (perimeter * acc) / total,
                (perimeter * curr.nb) / total,
                perimeter
              ],
              lineCap: "but"
            })
          })
        })
      );
      return acc + curr.nb;
    }, 0);

  return styles;
}

@Component({
  selector: "my-app",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"]
})
export class AppComponent {
  map: Map;

  VectorSource: VectorSource = new VectorSource({
    url: "../assets/ComuniInteressati.kml",
    format: new KML(),
    style: new Style()
  });

  VectorLayer: VectorLayer = new VectorLayer({
    source: new Cluster({
      distance: 40,
      source: this.VectorSource, 
    }),
    style: function(feature) {
        var size = feature.get("features").length;
        console.log(size);
        var style; // = this.styleCache;
        if (!style) {
          style = new Style({
            image: new CircleStyle({
              radius: 10+size,
              stroke: new Stroke({
                color: "#fff"
              }),
              fill: new Fill({
                color: "#3399CC"
              })
            }),
            text: new Text({
              text: size.toString(),
              fill: new Fill({
                color: "#fff"
              })
            })
          });
          //this.styleCache[size] = style;
        }
        return style;
      }
  });

  ngOnInit() {
    this.map = new Map({
      target: "map",
      layers: [
        new TileLayer({
          source: new Stamen({
            layer: "watercolor"
          })
        }),
        /*new TileLayer({
          source: new XYZ({ url: 'https://{a-c}.tile.osm.org/{z}/{x}/{y}.png' })
        }),
        new VectorLayer({
          source: this.vectorSource,
          style: [
            //new Style({ image: new Circle({ radius, fill: new Fill({ color: 'white' }) }) }),
            //...getDonutStyles(radius, width, repart)
          ]
        }),*/
        new TileLayer({
          source: new Stamen({
            layer: "terrain-labels"
          })

          /*
          source: new OSM({
            attributions: [
              'All maps © <a href="https://www.opencyclemap.org/">OpenCycleMap</a>',
              ATTRIBUTION
            ],
            url:
              "https://{a-c}.tile.thunderforest.com/cycle/{z}/{x}/{y}.png" +
              "?apikey=e40eafce191d45d9996738a6926e8e16"
          })
          */
        }),

        this.VectorLayer
      ],
      view: new View({
        center: [1388626, 5145039],
        zoom: 6
      })
    });

    /*
    const geojson = {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          properties: {},
          geometry: {
            type: "Point",
            coordinates: [0.115096092224121, 45.78757682111226]
          }
        }
      ]
    };

    this.vectorSource.addFeatures(
      new GeoJSON().readFeatures(geojson, {
        dataProjection: "EPSG:4326",
        featureProjection: "EPSG:3857"
      })
    );
    */
  }
}
