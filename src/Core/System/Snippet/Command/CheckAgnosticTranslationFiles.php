<?php declare(strict_types=1);

namespace Shopware\Core\System\Snippet\Command;

use Shopware\Core\Framework\Log\Package;
use Shopware\Core\System\Snippet\SnippetValidator;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Finder\Finder;

/**
 * @phpstan-type Snippets array<string, string|array<string, mixed>>
 */
#[AsCommand(
    name: 'translation:check-filenames',
    description: 'Ensures translations have a country agnostic translation file as a base',
)]
#[Package('discovery')]
class CheckAgnosticTranslationFiles extends Command
{
    /**
     * @internal
     */
    public function __construct(
    ) {
        parent::__construct();
    }

    protected function configure(): void
    {
        $this->addOption(
            'with-extensions',
            'a',
            InputOption::VALUE_NONE,
            'Use this option to also check the custom directory for faulty filenames'
        );
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $extensionDirectories = $input->getOption('with-extensions') ? ['custom'] : [];
        $directories = ['src', 'var', ...$extensionDirectories];

        $finder = (new Finder())
            ->files()
            ->in($directories)
            ->ignoreUnreadableDirs()
            ->name(SnippetValidator::SNIPPET_FILE_PATTERN);

        foreach ($finder as $file) {
            $filename = $file->getFilename();

            if (
                !preg_match(SnippetValidator::SNIPPET_FILE_PATTERN, $filename, $matches)
            ) {
                continue;
            }
            $normalizedLocale = str_replace('_', '-', $matches['locale']);

            $output->writeln(\sprintf(
                'File: %s | domain: %s | locale: %s | language: %s | script: %s | region: %s | isBase: %s',
                $filename,
                $matches['domain'],
                $normalizedLocale,
                $matches['language'],
                $matches['script'] ?? '',
                $matches['region'] ?? '',
                !empty($matches['isBase']) ? 'yes' : 'no'
            ));
        }

        return self::SUCCESS;
    }
}
