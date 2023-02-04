import os

def get_files(path):
  output = []
  get_files_impl('', os.sep.join(path.split('/')), output)
  return output

def get_files_impl(rel, abs, output):
  for file in os.listdir(abs):
    file_rel = file if rel == '' else (rel + '/' + file)
    file_abs = abs + os.sep + file
    if os.path.isdir(file_abs):
      get_files_impl(file_rel, file_abs, output)
    else:
      output.append(file_rel)

def file_write_text(path, content):
  c = open(os.sep.join(path.split('/')), 'wt')
  c.write(content)
  c.close()

# TODO: auto-atlas these if the loading gets too slow.
def main():
  files = map(lambda v: 'images/' + v, get_files('images'))
  image_files = list(filter(lambda path: path.endswith('.png') or path.endswith('.jpg'), files))
  
  js_image_manifest = 'const IMAGES = `' + '\n'.join(image_files) + '`;\n'
  file_write_text('src/gen/imageManifest.js', js_image_manifest)
  print("Done.")

if __name__ == "__main__":
  main()
