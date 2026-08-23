[CmdletBinding()]
param()

throw @"
Live synchronization into the production Atlas checkout is retired.
Publish an exact reviewed commit, then use deploy/atlas-release.sh prepare <commit>.
The server-side production checkout must remain immutable.
"@
