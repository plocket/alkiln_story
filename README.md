# alkiln_story

[Use alkiln_story](https://plocket.github.io/alkiln_story/) to generate a Story Table Step for a Scenario. The generated test can then be used with the Assembly Line Kiln (ALKiln) testing framework to automatically test your [docassemble](https://docassemble.org) interview.

1. On your development server, go through your interview until you reach the page where you want to stop the test.
1. Open the "Source" tab by tapping the "</>" in the header of your running interview.
1. Note the id of the page.
1. Tap "Show variables and values".
1. Copy all the text on that page. It should look something like [this text](https://raw.githubusercontent.com/plocket/alkiln_story/gh-pages/examples/al_test_framewor_test_1.json).
1. Follow the instructions at the [alkiln_story generator](https://plocket.github.io/alkiln_story/) to paste in that text and generate your Story Table.
1. Either
   * generate a full Feature file to put in your "Sources" folder or
   * copy the text for the single Scenario that you can then paste into an existing Feature file

## ALKiln

The [ALKiln testing framework](https://suffolklitlab.org/docassemble-AssemblyLine-documentation/docs/automated_integrated_testing) is free and open-source. It can be used with any docassemble project. but has some functionality designed specifically for interviews developed with Document Assembly Line Project tools. It is a work in progress.

## docassemble

[docassemble](https://docassemble.org) is a free and open-source expert system for guided interviews and document assembly, based on Python, YAML, and Markdown. It's currently most commonly used by legal organizations to create friendly online forms. It can generate PDFs or docx's from your users' answers, send emails and text messages based on user input, and accept signatures.

## The Document Assembly Line Project

The [Document Assembly Line Project](https://suffolklitlab.org/docassemble-AssemblyLine-documentation) is a free and open-source docassemble package that creates tools and processes to use with docassemble interviews. Among other things, it can help you generate boilerplate docassemble code from a PDF or docx, provides built-in commonly used questions, and provides a pre-built income module. It offers guidance on various topics, such as working as a team, using plain language, and collaborating through GitHub.

## Links
- [alkiln_story Story Table generator](https://plocket.github.io/alkiln_story/)
- [Story Table documentation specifically](https://suffolklitlab.org/docassemble-AssemblyLine-documentation/docs/automated_integrated_testing/#story-tables)
- [General ALKiln documentation](https://suffolklitlab.org/docassemble-AssemblyLine-documentation/docs/automated_integrated_testing)
- [ALKiln repository](https://github.com/suffolkLITLab/alkiln)
- [docassemble](https://docassemble.org)
- [Document Assembly Line Project](https://suffolklitlab.org/docassemble-AssemblyLine-documentation)
