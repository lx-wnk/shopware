import template from './sw-media-modal-v2.html.twig';

/**
 * @event media-modal-selection-change EntityProxy[]
 * @event closeModal (void)
 * @sw-package discovery
 */
// eslint-disable-next-line sw-deprecation-rules/private-feature-declarations
export default {
    template,

    props: {
        mediaModalConfig: {
            type: Object,
            required: false,
            default: () => ({}),
        },
    },

    data() {
        return {
            fileInputName: '',
        };
    },

    methods: {
        buttonProps(button) {
            // Convert deprecated button variants to new ones
            const variantMap = {
                ghost: 'secondary',
                danger: 'critical',
                'ghost-danger': 'critical',
                contrast: 'secondary',
                context: 'action',
            };

            const originalVariant = button.variant ?? 'primary';
            const mappedVariant = variantMap[originalVariant] ?? originalVariant;
            const isGhost = [
                'ghost',
                'ghost-danger',
            ].includes(originalVariant);

            return {
                method: button.method ?? (() => undefined),
                label: button.label ?? '',
                size: button.size ?? 'small',
                variant: mappedVariant,
                ghost: isGhost,
                square: button.square ?? false,
            };
        },
    },
};
