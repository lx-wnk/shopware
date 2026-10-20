/**
 * @sw-package discovery
 */
import { mount } from '@vue/test-utils';
import { reactive } from 'vue';

const entityMediaItems = [
    {
        id: '1',
        url: 'http://shopware.com/image1.jpg',
        position: 3,
    },
    {
        id: '2',
        url: 'http://shopware.com/image2.jpg',
        position: 1,
    },
    {
        id: '3',
        url: 'http://shopware.com/image3.jpg',
        position: 2,
    },
];

async function createWrapper(mediaItems = entityMediaItems) {
    return mount(await wrapTestComponent('sw-media-list-selection-v2', { sync: true }), {
        props: {
            entity: {},
            entityMediaItems: reactive([...mediaItems]),
        },
        global: {
            provide: {
                mediaService: {},
            },
            stubs: {
                'sw-media-upload-v2': true,
                'sw-media-list-selection-item-v2': await wrapTestComponent('sw-media-list-selection-item-v2'),
                'sw-media-preview-v2': {
                    props: ['source'],
                    template: '<div class="sw-media-preview-v2">{{ source }}</div>',
                },
                'sw-context-button': true,
                'sw-context-menu-item': true,
                'sw-loader': true,
            },
        },
    });
}

describe('components/media/sw-media-list-selection-v2', () => {
    it('should set the position property for each item by index in computed', async () => {
        const wrapper = await createWrapper();
        await flushPromises();

        const mediaItems = wrapper.vm.mediaItems;

        mediaItems.forEach((item, index) => {
            expect(item.position).toBe(index);
        });
    });

    it('should keep a separate position for each occurrence of the same media', async () => {
        const [firstMedia, secondMedia] = entityMediaItems;
        const wrapper = await createWrapper([
            firstMedia,
            secondMedia,
            firstMedia,
            secondMedia,
        ]);
        await flushPromises();

        const positions = wrapper.vm.mediaItems.map((item) => item.position);
        expect(positions).toEqual([
            0,
            1,
            2,
            3,
        ]);
        expect(wrapper.vm.mediaItems.map((item) => item.id)).toEqual([
            '1',
            '2',
            '1',
            '2',
        ]);
    });

    it('should render every occurrence of the same media with a unique key', async () => {
        const [firstMedia, secondMedia] = entityMediaItems;
        const wrapper = await createWrapper([
            firstMedia,
            secondMedia,
            firstMedia,
            secondMedia,
        ]);
        await flushPromises();

        const keys = wrapper.vm.mediaItemKeys;
        expect(new Set(keys).size).toBe(keys.length);
        expect(wrapper.findAll('.sw-media-list-selection-item-v2')).toHaveLength(4);
    });

    it('should create placeholders with their own position and key', async () => {
        const wrapper = await createWrapper();
        await flushPromises();

        // two rows of four columns leave room for five placeholders next to the three media items
        await wrapper.setData({ columnCount: 4 });

        const placeholders = wrapper.vm.mediaItems.filter((item) => item.isPlaceholder);
        expect(placeholders).toHaveLength(5);
        expect(placeholders.map((item) => item.position)).toEqual([
            3,
            4,
            5,
            6,
            7,
        ]);

        const keys = wrapper.vm.mediaItemKeys;
        expect(new Set(keys).size).toBe(keys.length);
    });

    it('should emit item-sort event when drag and drop item valid', async () => {
        const wrapper = await createWrapper();
        await flushPromises();

        await wrapper.vm.onMediaItemDragSort({ id: 2, position: 1 }, { id: 1, position: 2 }, true);
        await wrapper.vm.$nextTick();

        expect(wrapper.emitted()['item-sort']).toBeTruthy();
        expect(wrapper.emitted()['item-sort'][0]).toEqual([
            { id: 2, position: 1 },
            { id: 1, position: 2 },
        ]);
    });

    it('should not emit item-sort event when drag and drop item valid', async () => {
        const wrapper = await createWrapper();
        await flushPromises();

        await wrapper.vm.onMediaItemDragSort();
        await wrapper.vm.$nextTick();

        expect(wrapper.emitted('item-sort')).not.toBeTruthy();
    });

    it('should update the sw-media-list-selection-item-v2 when URL in the mediaItem changes', async () => {
        const wrapper = await createWrapper();
        await flushPromises();

        // First media item should contain the ID 1
        const firstMediaItem = wrapper.find('.sw-media-list-selection-item-v2');
        expect(firstMediaItem.text()).toContain('1');

        // Update the ID and URL of the first media item
        await wrapper.setProps({
            entityMediaItems: [
                {
                    id: 'newId',
                    url: 'http://shopware.com/image1-updated.jpg',
                    position: 3,
                },
                {
                    id: '2',
                    url: 'http://shopware.com/image2.jpg',
                    position: 1,
                },
                {
                    id: '3',
                    url: 'http://shopware.com/image3.jpg',
                    position: 2,
                },
            ],
        });

        await flushPromises();

        // First media item should contain the updated ID
        const updatedFirstMediaItem = wrapper.find('.sw-media-list-selection-item-v2');
        expect(updatedFirstMediaItem.text()).toContain('newId');
    });
});
