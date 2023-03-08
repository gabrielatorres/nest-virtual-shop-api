/* eslint-disable @typescript-eslint/ban-types */
import { v4 as uuid } from 'uuid';
// Esto funciona para renombrar archivos
export const fileNamer = (
  req: Express.Request,
  file: Express.Multer.File,
  cb: Function,
) => {
  console.log(file);
  if (!file) return cb(new Error('File is empty'), false);

  const fileExtension = file.mimetype.split('/')[1];
  const fileName = `${uuid()}.${fileExtension}`;

  cb(null, fileName);
};
