<template>
  <canvas id="canvas" ref="canvas" class="canvas" :width="width" :height="height"></canvas>
</template>

<script setup lang="ts">
import QRCode from "qrcode";
import { onMounted, ref, defineProps } from "vue";

const props = defineProps({
  //二维码存储内容
  qrUrl: {
    type: String,
    default: "Hello World"
  },
  // canvas width
  width: {
    type: Number,
    default: 300
  },
  // canvas height
  height: {
    type: Number,
    default: 300
  },
  // 二维码尺寸（正方形 长宽相同）
  qrSize: {
    type: Number,
    default: 300
  },
  // 二维码底部文字
  qrText: {
    type: String,
    default: ""
  },
  //底部说明文字字号
  qrTextSize: {
    type: Number,
    default: 24
  }
});

const qrCodeOption = {
  errorCorrectionLevel: "H",
  width: props.qrSize,
  version: 7
};

const canvas = ref<HTMLCanvasElement>();
/**
 * @argument qrUrl        二维码内容
 * @argument qrSize       二维码大小
 * @argument qrText       二维码中间显示文字
 * @argument qrTextSize   二维码中间显示文字大小(默认16px)
 */
const handleQrcode = () => {
  let dom = canvas.value as HTMLCanvasElement;
  QRCode.toDataURL(props.qrUrl, qrCodeOption)
      .then((url: string) => {
        // 画二维码里的logo// 在canvas里进行拼接
        const ctx = dom.getContext("2d") as CanvasRenderingContext2D;
        const image = new Image();
        image.src = url;
        setTimeout(() => {
          ctx.drawImage(image, (props.width - props.qrSize) / 2, 0, props.qrSize, props.qrSize);
          if (props.qrText) {
            //设置字体
            ctx.font = "bold " + props.qrTextSize + "px Arial";
            let tw = ctx.measureText(props.qrText).width; // 文字真实宽度
            let ftop = props.qrSize - props.qrTextSize; // 根据字体大小计算文字top
            let fleft = (props.width - tw) / 2; // 根据字体大小计算文字left
            ctx.fillStyle = "#fff";
            ctx.textBaseline = "top"; //设置绘制文本时的文本基线。
            ctx.fillStyle = "#333";
            ctx.fillText(props.qrText, fleft, ftop);
          }
        }, 0);
      })
      .catch((err: Error) => {
        console.error(err);
      });
};

onMounted(() => {
  handleQrcode();
});
</script>

<style lang="scss" scoped></style>


