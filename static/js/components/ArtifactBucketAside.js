const ArtifactBucketAside = {
    components: {
        'artifact-storage': ArtifactStorage,
    },
    props: ['isInitDataFetched', 'selectedBucketRowIndex', 'selectedBucket', 'bucketCount', 'checkedBucketsList'],
    data() {
        return {
            canSelectItems: false,
            loadingDelete: false,
            isShowSearch: false,
        }
    },
    computed: {
        isAnyBucketSelected() {
            return this.checkedBucketsList.length > 0;
        },
        responsiveTableHeight() {
            return `${(window.innerHeight - 410)}px`;
        }
    },
    watch: {
        isInitDataFetched() {
            this.setBucketEvents();
        }
    },
    mounted() {
        const vm = this;
        $('#bucketFilter').on('changed.bs.select', function ({ target: { value }}) {
            vm.$emit('update-bucket-list', []);
            $('#bucket-table').bootstrapTable('filterBy', {
                tag: value.toLowerCase() ?? 'fuck'
            }, {
                'filterAlgorithm': (row, filters) => {
                    const tag = filters ? filters.tag : 'all';
                    return tag === 'all' ? true
                        : row.tags.type === tag;
                }
            })
            if (vm.selectedBucket.id) {
                $('#bucket-table').find(`[data-uniqueid='${vm.selectedBucket.id}']`).addClass('highlight');
            }
        });

        $('#bucketSearch').on('input', function ({ target: { value }}) {
            vm.$emit('update-bucket-list', []);
            $('#bucket-table').bootstrapTable('filterBy', {
                name: value.toLowerCase()
            }, {
                'filterAlgorithm': (row, filters) => {
                    const name = filters ? filters.name : '';
                    return row.name.includes(name);
                }
            })
            if (vm.selectedBucket.id) {
                $('#bucket-table').find(`[data-uniqueid='${vm.selectedBucket.id}']`).addClass('highlight');
            }
        })
    },
    methods: {
        setBucketEvents() {
            const vm = this;
            $('#bucket-table').on('check.bs.table', (row, $element) => {
                const buckets = [...this.checkedBucketsList, $element.name]
                this.$emit('update-bucket-list', buckets);
            });
            $('#bucket-table').on('uncheck.bs.table', (row, $element) => {
                const buckets = this.checkedBucketsList.filter(bucket => {
                    return $element.name !== bucket
                })
                this.$emit('update-bucket-list', buckets);
            });
            $('#bucket-table').on('uncheck-all.bs.table', (row, $element) => {
                this.$emit('update-bucket-list', []);
            });
            $('#bucket-table').on('check-all.bs.table', (rowsAfter, rowsBefore) => {
                const buckets = rowsBefore.map(row => row.name);
                this.$emit('update-bucket-list', buckets);
            });
            $('#bucket-table').on('sort.bs.table', function (name, order) {
                vm.$nextTick(() => {
                    $('#bucket-table').find(`[data-uniqueid='${vm.selectedBucket.id}']`).addClass('highlight');
                })
            });
        },
        switchSelectItems() {
            this.canSelectItems = !this.canSelectItems;
            const action = this.canSelectItems ? 'showColumn' : 'hideColumn';
            console.log(action)
            $('#bucket-table').bootstrapTable(action, 'select');
            document.getElementById("bucket-table")
                .rows[this.selectedBucketRowIndex + 1]
                .classList.add('highlight');
        },
    },
    template: `
        <aside class="m-3 card card-table-sm" style="width: 450px">
            <div class="row p-4">
                <div class="col-4">
                    <h4>Bucket</h4>
                </div>
                <div class="col-8">
                    <div class="d-flex justify-content-end">
                        <button type="button"
                             data-toggle="modal" 
                             data-target="#bucketModal"
                             class="btn btn-basic btn-sm btn-icon__sm mr-2">
                            <i class="fas fa-plus"></i>
                        </button>
                        <button type="button" class="btn btn-secondary btn-sm btn-icon__purple btn-icon__sm mr-2"
                            @click="this.isShowSearch = !this.isShowSearch">
                            <i class="icon__18x18 icon-search__18"></i>
                        </button>
                        <button type="button" class="btn btn-secondary btn-sm btn-icon__purple btn-icon__sm mr-2"
                            @click="switchSelectItems">
                            <i class="icon__18x18 icon-multichoice"></i>
                        </button>
                        <button type="button" 
                            @click="$emit('open-confirm', 'multiple')"
                            :disabled="!isAnyBucketSelected"
                            class="btn btn-secondary btn-sm btn-icon__sm btn-icon__purple">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </div>
                </div>
            </div>
            <div class="w-100 card px-4 pb-3" style="box-shadow: none">
                <div v-show="isShowSearch" class="custom-input custom-input_search position-relative mb-3">
                    <input
                        id="bucketSearch"
                        type="text"
                        placeholder="Bucket name">
                    <img src="/design-system/static/assets/ico/search.svg" class="icon-search position-absolute">
                </div>
                <select id="bucketFilter" class="selectpicker bootstrap-select__b" data-style="btn">
                    <option>All</option>
                    <option>Local</option>
                    <option>Autogenerated</option>
                    <option>System</option>
                </select>
            </div>
            <div class="card-body">
                <table class="table table-borderless table-fix-thead"
                    id="bucket-table"
                    data-toggle="table"
                    data-unique-id="id"
                    data-sort-name="name" 
                    data-sort-order="asc"
                    data-pagination-pre-text="<img src='/design-system/static/assets/ico/arrow_left.svg'>"
                    data-pagination-next-text="<img src='/design-system/static/assets/ico/arrow_right.svg'>">
                    <thead class="thead-light bg-transparent">
                        <tr>
                            <th data-visible="false" data-field="id">index</th>
                            <th data-checkbox="true" data-visible="false" data-field="select"></th>
                            <th data-visible="false" data-field="tags"></th>
                            <th scope="col" data-sortable="true" data-field="name" class="bucket-name">NAME</th>
                            <th scope="col" data-sortable="true" data-field="size" data-sorter="filesizeSorter" class="bucket-size">SIZE</th>
                            <th scope="col"
                                data-formatter='<div class="d-none">
                                    <button class="btn btn-default btn-xs btn-table btn-icon__xs bucket_delete"><i class="fas fa-trash-alt"></i></button>
                                    <button class="btn btn-default btn-xs btn-table btn-icon__xs bucket_setting"><i class="fas fa-gear"></i></button>
                                </div>'
                                data-events="bucketEvents">
                            </th>
                        </tr>
                    </thead>
                    <tbody :style="{'height': responsiveTableHeight}">
                    </tbody>
                </table>
                <div class="p-3">
                    <span class="font-h5 text-gray-600">{{ bucketCount }} items</span>
                </div>
            </div>
            <artifact-storage
                @register="$root.register"
                instance_name="storage"
                :bucketCount="bucketCount"
                :key="bucketCount">
            </artifact-storage>
        </aside>
    `
}