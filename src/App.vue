<template>
    <div id="app">
        <link href="https://fonts.googleapis.com/css?family=Roboto+Condensed" rel="stylesheet">
        <div class="panels">
            <div class="panels__left">
                <header class="header">
                    <div class="header__logo">
                        Taxi
                    </div>
                </header>
                <section class="panels__carlist">
                    <Cars v-bind:treeGroups="treeGroups" v-bind:treeCars="treeCars" v-bind:commandStatusCars="commandStatusCars" v-bind:commandStatusOk="commandStatusOk"></Cars>
                </section>
                <section class="panels__info">
                    <template v-if="currentCar != null">
                        <Period v-bind:currentTrip="CurrentTrip"></Period>
                    </template>
                    <template v-else>
                        <div class="alert alert-primary" role="alert">
                            Выберите транспортное средство
                        </div>
                    </template>
                </section>
                <section class="panels__journal">
                    <template v-if="currentCar != null">
                        <CarState v-bind:currentCar="currentCar" v-bind:commandStatusCar="commandStatusCars[currentCar.ID]" v-bind:commandStatusOk="commandStatusOk" v-bind:commandName="commandName"></CarState>
                    </template>
                    <Journal v-bind:currentCar="currentCar" v-bind:cars="cars" v-bind:commandName="commandName"></Journal>
                </section>
                <footer class="footer">
                    &copy;&thinsp;AutoGRAPH
                </footer>
            </div>
            <section class="panels__right">
                <div id="map" class="map"></div>
            </section>
        </div>
    </div>
</template>

<script lang="ts">
    import { Component, Vue } from 'vue-property-decorator';
    import L from 'leaflet';
    import moment from 'moment';
    import { $bus, connector } from './main';
    import { buildCircle, buildPolygon, buildTooltip, markerGetIcon } from './assets/ts/Extenders';
    import { IEnumDeviceItem, IGetOnlineInfoItem, ICommandResultItem, DCStatus } from './assets/ts/ServiceConnector';
    import { CarTrip } from './assets/ts/CarTrip';

    import Cars from '@/components/Cars.vue';
    import Period from '@/components/Period.vue';
    import CarState from '@/components/CarState.vue';
    import Journal from '@/components/Journal.vue';

    @Component({
        components: {
            Cars,
            Period,
            CarState,
            Journal
        }
    })
    export default class App extends Vue {
        private readonly commandName = 'MOUT1';
        private readonly commandStatusOk = 1;
        private map: L.Map | undefined;
        private layerCars: L.LayerGroup = L.layerGroup([], {});
        private carGroups: any = {};
        private cars: any = {};
        private CurrentTrip: CarTrip;
        private treeGroups: any = {};
        private treeCars: any = {};
        private commandStatusCars: any = {};
        private currentCar: IEnumDeviceItem | null = null;

        constructor () {
            super();
            this.CurrentTrip = new CarTrip(connector);
        }

        private created(): void {
            $bus.$on('SelectGroupItem', (id: string) => {
                this.refreshPositions(id);
                this.currentCar = null;
            });

            $bus.$on('SelectCarItem', (id: string) => {
                const sd = moment().startOf('day').add(-1, 'day').toDate();
                const ed = moment(sd).add(2, 'day').toDate();
                this.currentCar = this.cars[id];
                this.CurrentTrip.Build(this.currentCar as IEnumDeviceItem, sd, ed);
            });

            $bus.$on('ChangeCarState', () => {
                $bus.$emit('RefreshCommandsLog');
            });

            $bus.$on('ResultCommandsLog', (r: ICommandResultItem[]) => {
                this.commandStatusCars = {};
                r.forEach((item: ICommandResultItem) => {
                    if (item.Name == this.commandName && ! this.commandStatusCars[item.IDCAR]) {
                        this.commandStatusCars[item.IDCAR] = item;
                    }
                });
            });
        }

        private mounted(): void {
            this.CurrentTrip.map = this.map = L.map('map', {
                preferCanvas: true,
                zoomControl: false
            });

            L.control.zoom({
                position: 'topright'
            }).addTo(this.map);

            this.map.addLayer(L.tileLayer('//{s}.tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png', {
                updateWhenIdle: true,
                detectRetina: true
            }))
            .setView([55.5, 61.2], 13)
            .addLayer(this.layerCars)
            .addLayer(this.CurrentTrip.layerTrip);

            connector.EnumDevices().then((r: any) => {
                this.treeGroups = {};
                r.Groups.forEach((g: any) => {
                    if ( ! this.treeGroups[g.ParentID]) {
                        this.treeGroups[g.ParentID] = [];
                    }

                    this.treeGroups[g.ParentID].push(g);
                });

                this.treeCars = {};
                r.Items.forEach((i: any) => {
                    if ( ! this.treeCars[i.ParentID]) {
                        this.treeCars[i.ParentID] = [];
                    }

                    this.treeCars[i.ParentID].push(i);
                });

                for (let id in this.treeCars) {
                    this.treeCars[id].sort((a: IEnumDeviceItem, b: IEnumDeviceItem) => (a.Name > b.Name) ? 1 : -1);
                }

                r.Items.forEach((c: any) => this.cars[c.ID] = c);

                this.refreshPositions(null);

                $bus.$emit('RefreshCommandsLog');
            });
        }

        private refreshPositions(groupActiveID: string | null): void {
            connector.GetOnlineInfo(groupActiveID == null ? null : [groupActiveID]).then((r: any) => {
                let bounds = L.latLngBounds([]);

                this.layerCars.clearLayers();

                Object.keys(r).forEach((i: any) => {
                    let p = r[i];

                    if (p != null && p._LastCoords != null) {
                        this.refreshPositionItem(p, bounds);
                    }
                });

                if (this.map && bounds.isValid())
                    this.map.fitBounds(bounds);
            });
        }

        private refreshPositionItem(p: IGetOnlineInfoItem, bounds: L.LatLngBounds): void {
            const ll = L.latLng(p.LastPosition.Lat, p.LastPosition.Lng);
            const car = this.cars[p.ID];

            if (car) {
                L.marker(ll, <any>{
                        icon: markerGetIcon(p, car),
                        carID: p.ID
                    })
                    .bindTooltip(buildTooltip(car, this.carGroups[car.ParentID], p))
                    .on('click', (m) => $bus.$emit('SelectCarItem', m.target.options.carID))
                    .addTo(this.layerCars);
                bounds.extend(ll);
            }
        }
    }
</script>

<style lang="scss">
    @import './assets/scss/reset';
    @import '~leaflet/dist/leaflet.css';
    @import './assets/scss/app';
</style>
