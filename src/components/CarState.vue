<template>
    <div v-bind:class="{'car-state': true, 'car-state--on': status == commandStatusOk, 'car-state--off': status != commandStatusOk}">
        Состояние: <span class="car-state__value">{{ status == commandStatusOk ? 'включено' : 'выключено' }}</span>,
        <button @click="changeState" class="car-state__control">{{ status == commandStatusOk ? 'выключить' : 'включить' }}</button>
    </div>
</template>

<script lang="ts">
    import { Component, Prop, Vue } from 'vue-property-decorator';
    import { connector, $bus } from '../main';
    import { IEnumDeviceItem, DeviceCommandType, DCStatus } from '../assets/ts/ServiceConnector';

    @Component
    export default class CarState extends Vue {
        @Prop() private currentCar!: IEnumDeviceItem;
        @Prop() private status!: DCStatus;
        @Prop() private commandStatusOk!: DCStatus;

        private readonly commandName = 'GET'; // MOUT1

        private changeState(): void {
            connector.SendCommand([this.currentCar.ID], this.commandName, [this.status == this.commandStatusOk ? '0' : '1']).then((r: string[]) => {
                $bus.$emit('ChangeCarState', this.status != DCStatus.OK);
            });
        }
    }
</script>

<style lang="scss">
    .car-state {
        margin-bottom: 1em;

        &--on &__control {
            background: #e55039;
        }

        &--off &__control {
            background: #b8e994;
        }

        &__control {
            border: 0;
            outline: 0;
            line-height: 20px;
        }
    }
</style>
