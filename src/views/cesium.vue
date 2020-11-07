<template>
  <div id="cesiumContainer">
    <WFSLayer></WFSLayer>
<!--     <editor></editor> -->
    <editor2></editor2>
  </div>
</template>
<script>
export default {
  name: "cesium",
  data() {
    return {
      token:
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOi      IxOTFkYWQwOS1lNTc2LTRiNWEtYWViYy1kMWRlYTMwMThmYmYiLCJpZCI6MTQyMTgsInNjb3      BlcyI6WyJhc3IiLCJnYyJdLCJpYXQiOjE1NjUwNTg3Mjh9.-i_ptqSPUBS0xhew3bh5F66Id      lYY1Kz_CZ5UkN1-0a0",
    };
  },
  methods: {
    initCesium() {
      let viewer = new Cesium.Viewer("cesiumContainer", {
      geocoder : false,
      homeButton : false,
      sceneModePicker : false,
      baseLayerPicker : false,
      navigationHelpButton : false
      });
      window.cesiumViewer = viewer; //不要把cesium实例挂载到vue的data对象中(有性能问题)
      // this.hideRightWidgets() // 隐藏右上角的控件
    },
    addDom() {
      window.cesiumViewer.imageryLayers.addImageryProvider(
        new Cesium.WebMapTileServiceImageryProvider({
          url: `http://t0.tianditu.gov.cn/img_w/wmts?tk=a89df02c93e5474e9ebeb81a32fcb487`, //记得换成自己的key
          layer: "img",
          style: "default",
          tileMatrixSetID: "w",
          format: "tiles",
          maximumLevel: 18,
        })
      );
      window.cesiumViewer.imageryLayers.addImageryProvider(
        new Cesium.WebMapTileServiceImageryProvider({
          url: `http://t0.tianditu.gov.cn/cia_w/wmts?tk=a89df02c93e5474e9ebeb81a32fcb487`, //记得换成自己的key
          layer: "cia",
          style: "default",
          tileMatrixSetID: "w",
          format: "tiles",
          maximumLevel: 18,
        })
      );
    },
    addNav() {
      window.cesiumViewer.cesiumWidget.creditContainer.style.display = "none";
      //   window.cesiumViewer.terrainProvider = cesiumTerrainProvider;
      window.cesiumViewer.extend(Cesium.viewerCesiumNavigationMixin, {});
    },
    hideRightWidgets() {
      window.cesiumViewer.geocoder = false
      window.cesiumViewer.homeButton = false
      window.cesiumViewer.sceneModePicker = false
      window.cesiumViewer.baseLayerPicker = false
      window.cesiumViewer.navigationHelpButton = false
    }
  },
  mounted() {
    this.initCesium();
    // this.addNav();
    // this.addDom();
  },
  components: {
    WFSLayer: () => import("../components/Layers"),
    Editor: () => import("../components/Editor"),
    Editor2: () => import("../components/Editor2")
  }
};
</script>
<style scoped>
#cesiumContainer {
  height: 100%;
}
</style>