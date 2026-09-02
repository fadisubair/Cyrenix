import os
import glob

def replace_in_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    # Replacements
    content = content.replace('text-white', 'text-zinc-100')
    content = content.replace('text-gray-', 'text-zinc-')
    content = content.replace('border-gray-', 'border-zinc-')
    content = content.replace('bg-gray-', 'bg-zinc-')
    content = content.replace('bg-primary/20', 'bg-indigo-900/30')
    content = content.replace('bg-primary/10', 'bg-indigo-900/30')
    content = content.replace('text-primary', 'text-indigo-400')
    content = content.replace('bg-background/50', 'bg-zinc-950')
    content = content.replace('bg-background', 'bg-zinc-950')
    content = content.replace('rounded-lg', 'rounded-md')
    content = content.replace('rounded-xl', 'rounded-md')
    # Let's fix badges as well in these files, some might use neon colors explicitly
    content = content.replace('text-cyan-400', 'text-indigo-400')
    content = content.replace('text-cyan-500', 'text-emerald-400')
    content = content.replace('text-blue-400', 'text-indigo-400')
    content = content.replace('text-blue-500', 'text-indigo-400')
    content = content.replace('text-purple-400', 'text-indigo-400')
    content = content.replace('text-purple-500', 'text-indigo-400')

    with open(filepath, 'w') as f:
        f.write(content)

pages_dir = '/home/fadisubair/Cyrenix/frontend/src/pages'
for filepath in glob.glob(os.path.join(pages_dir, '*.tsx')):
    # Skip already refactored files
    if 'IncidentDetails.tsx' in filepath or 'Dashboard.tsx' in filepath or 'IncidentList.tsx' in filepath or 'Login.tsx' in filepath or 'Settings.tsx' in filepath:
        continue
    replace_in_file(filepath)

components_dir = '/home/fadisubair/Cyrenix/frontend/src/components'
for filepath in glob.glob(os.path.join(components_dir, '*.tsx')):
    if 'Button.tsx' in filepath or 'Badge.tsx' in filepath or 'Layout.tsx' in filepath:
        continue
    replace_in_file(filepath)
    
print("Replacements complete")
