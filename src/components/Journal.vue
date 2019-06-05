<template>
    <div class="journal">
        <div class="journal__wrap">
            <template v-if="log.length > 0">
                <table class="journal__table table">
                    <thead>
                        <tr>
                            <th v-if="currentCar == null">ТС</th>
                            <th>Команда</th>
                            <th>Дата</th>
                            <th>Ответ</th>
                            <th>Статус</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="item in log">
                            <td v-if="currentCar == null">{{ cars[item.IDCAR].Name }}<br /><small>№{{ item.Serial }}</small></td>
                            <td>{{ item.Command }}</td>
                            <td>{{ item.DT }}</td>
                            <td>{{ item.Response }}</td>
                            <td>{{ item.Status }}</td>
                        </tr>
                    </tbody>
                </table>
            </template>
            <template v-else>
                <div class="alert alert-primary" role="alert">
                    Нет событий
                </div>
            </template>
        </div>
    </div>
</template>

<script lang="ts">
    import { Component, Prop, Vue } from 'vue-property-decorator';
    import { connector, $bus } from '../main';
    import { IEnumDeviceItem, ICommandResultItem } from '../assets/ts/ServiceConnector';
    import { getDT } from '../assets/ts/Extenders';
    import moment from 'moment';

    @Component
    export default class Journal extends Vue {
        @Prop() private currentCar!: IEnumDeviceItem | null;
        @Prop() private cars!: any;

        private log: ICommandResultItem[] = [];

        private mounted(): void {
            $bus.$on('RefreshCommandsLog', () => {
                const sd = moment().startOf('day').add('day', -2).toDate();
                const ed = moment().toDate();

                this.log = [];

                connector.GetCommandLog(sd, ed).then((r: ICommandResultItem[]) => {
                    const log: ICommandResultItem[] = [];

                    r.reverse();

                    $bus.$emit('ResultCommandsLog', r);

                    if (this.currentCar == null) {
                        this.log = r;
                    } else {
                        r.forEach((item: ICommandResultItem) => {
                            if (this.currentCar != null && this.currentCar.ID == item.IDCAR) {
                                this.log.push(item);
                            }
                        });
                    }

                    this.log.forEach((item: ICommandResultItem) => {
                        const dt = getDT(item.DT, true);
                        item.DT = dt.D + ' ' + dt.T;
                    });

                    // --- set height

                    if (this.log.length > 0) {
                        const footer: HTMLElement = document.querySelector('.footer') as HTMLElement;
                        const wrap: HTMLElement = document.querySelector('.journal__wrap') as HTMLElement;
                        const pos: ClientRect = wrap.getBoundingClientRect() as ClientRect;

                        wrap.style.height = (window.innerHeight - pos.top - footer.clientHeight) + 'px';
                    }
                });
            });

            this.$watch('currentCar', () => {
                $bus.$emit('RefreshCommandsLog');
            });
        }
    }
</script>

<style lang="scss">
    .journal {
        &__wrap {
            margin: 0 -.5em;
            overflow: auto;
        }

        &__table {
            th,
            td {
                &:first-child {
                    padding-left: .5em;
                }

                &:last-child {
                    padding-right: .5em;
                }
            }
        }
    }
</style>
